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
    const params: (string | number)[] = [validLimit, offset];
    const countParams: (string | number)[] = [];

    if (sku) {
      whereClause = 'WHERE a.sku ILIKE $3';
      params.push(`%${sku}%`);
      countParams.push(`%${sku}%`);
    }

    const queryStr = `
      SELECT 
        a.id,
        a.sku,
        a.qty,
        (a.qty * p.price) as amount,
        a.created_at,
        a.updated_at
      FROM adjustment_transactions a
      JOIN products p ON a.sku = p.sku
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM adjustment_transactions a
      ${whereClause.replace('a.sku', 'a.sku')}
    `;

    const [transactions, countResult] = await Promise.all([
      db.any(queryStr, params),
      db.one(
        sku ? countQuery : 'SELECT COUNT(*) as total FROM adjustment_transactions',
        countParams
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
    const query = `
      SELECT 
        a.id,
        a.sku,
        a.qty,
        (a.qty * p.price) as amount,
        a.created_at,
        a.updated_at
      FROM adjustment_transactions a
      JOIN products p ON a.sku = p.sku
      WHERE a.id = $1
    `;

    return await db.oneOrNone(query, [id]);
  }

  async createAdjustmentTransaction(sku: string, qty: number): Promise<AdjustmentTransaction> {
    const insertQuery = `
      INSERT INTO adjustment_transactions (sku, qty)
      VALUES ($1, $2)
      RETURNING id
    `;

    const result = await db.one(insertQuery, [sku, qty]);

    // Get the created transaction with calculated amount
    return this.getAdjustmentTransactionById(result.id) as Promise<AdjustmentTransaction>;
  }

  async updateAdjustmentTransaction(
    id: number,
    sku: string,
    qty: number
  ): Promise<AdjustmentTransaction> {
    const updateQuery = `
      UPDATE adjustment_transactions
      SET sku = $1, qty = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;

    await db.none(updateQuery, [sku, qty, id]);

    // Get the updated transaction with calculated amount
    return this.getAdjustmentTransactionById(id) as Promise<AdjustmentTransaction>;
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
