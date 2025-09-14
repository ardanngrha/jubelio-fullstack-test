import db from '../database/connection.ts';
import type {
  AdjustmentTransaction,
  AdjustmentTransactionQuery,
} from '../models/AdjustmentTransaction.ts';
import { createPaginatedResponse, getPaginationParams } from '../utils/pagination.ts';
import type { PaginatedResponse } from '../utils/pagination.ts';

export class AdjustmentTransactionRepository {
  async getAdjustmentTransactions(
    query: AdjustmentTransactionQuery
  ): Promise<PaginatedResponse<AdjustmentTransaction>> {
    const { page, limit, sku } = query;
    const { page: validPage, limit: validLimit } = getPaginationParams(page, limit);
    const offset = (validPage - 1) * validLimit;

    let whereClause = '';
    const params: unknown[] = [validLimit, offset];

    if (sku) {
      whereClause = 'WHERE sku = $3';
      params.push(sku);
    }

    const queryStr = `
      SELECT * FROM adjustment_transactions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM adjustment_transactions
      ${whereClause}
    `;

    const [transactions, countResult] = await Promise.all([
      db.any(queryStr, params),
      db.one(
        sku ? countQuery : 'SELECT COUNT(*) as total FROM adjustment_transactions',
        sku ? [sku] : []
      ),
    ]);

    return createPaginatedResponse(
      transactions as AdjustmentTransaction[],
      parseInt(countResult.total),
      validPage,
      validLimit
    );
  }

  async getAdjustmentTransactionById(id: number): Promise<AdjustmentTransaction | null> {
    return await db.oneOrNone('SELECT * FROM adjustment_transactions WHERE id = $1', [id]);
  }

  async createAdjustmentTransaction(
    sku: string,
    qty: number,
    amount: number
  ): Promise<AdjustmentTransaction> {
    const query = `
      INSERT INTO adjustment_transactions (sku, qty, amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    return await db.one(query, [sku, qty, amount]);
  }

  async updateAdjustmentTransaction(
    id: number,
    sku: string,
    qty: number,
    amount: number
  ): Promise<AdjustmentTransaction> {
    const query = `
      UPDATE adjustment_transactions
      SET sku = $1, qty = $2, amount = $3
      WHERE id = $4
      RETURNING *
    `;

    return await db.one(query, [sku, qty, amount, id]);
  }

  async deleteAdjustmentTransaction(id: number): Promise<boolean> {
    const result = await db.result('DELETE FROM adjustment_transactions WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async getCurrentStock(sku: string, excludeTransactionId?: number): Promise<number> {
    let query =
      'SELECT COALESCE(SUM(qty), 0) as current_stock FROM adjustment_transactions WHERE sku = $1';
    const params: (string | number)[] = [sku];

    if (excludeTransactionId) {
      query += ' AND id != $2';
      params.push(excludeTransactionId);
    }

    const stockResult = await db.oneOrNone(query, params);
    return parseInt(stockResult?.current_stock || '0');
  }
}
