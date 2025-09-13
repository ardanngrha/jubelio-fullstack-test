import db from '../database/connection.ts';
import type {
  AdjustmentTransaction,
  AdjustmentTransactionQuery,
} from '../models/AdjusmentTransaction.ts';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination.ts';
import type { PaginatedResponse } from '../utils/pagination.ts';

export class AdjustmentTransactionService {
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

  async createAdjustmentTransaction(sku: string, qty: number): Promise<AdjustmentTransaction> {
    // Check if product exists
    const product = await db.oneOrNone('SELECT * FROM products WHERE sku = $1', [sku]);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check current stock
    const stockResult = await db.oneOrNone(
      'SELECT COALESCE(SUM(qty), 0) as current_stock FROM adjustment_transactions WHERE sku = $1',
      [sku]
    );
    const currentStock = parseInt(stockResult?.current_stock || '0');

    // Validate that stock won't go below 0
    if (currentStock + qty < 0) {
      throw new Error(
        `Transaction would result in negative stock. Current: ${currentStock}, Requested: ${qty}`
      );
    }

    // Calculate amount
    const amount = product.price * Math.abs(qty);

    const query = `
      INSERT INTO adjustment_transactions (sku, qty, amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    return await db.one(query, [sku, qty, amount]);
  }

  async updateAdjustmentTransaction(
    id: number,
    sku?: string,
    qty?: number
  ): Promise<AdjustmentTransaction> {
    // Get current transaction
    const currentTransaction = await db.oneOrNone(
      'SELECT * FROM adjustment_transactions WHERE id = $1',
      [id]
    );

    if (!currentTransaction) {
      throw new Error('Transaction not found');
    }

    const newSku = sku || currentTransaction.sku;
    const newQty = qty !== undefined ? qty : currentTransaction.qty;

    // Check if product exists
    const product = await db.oneOrNone('SELECT * FROM products WHERE sku = $1', [newSku]);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check stock excluding current transaction
    const stockResult = await db.oneOrNone(
      'SELECT COALESCE(SUM(qty), 0) as current_stock FROM adjustment_transactions WHERE sku = $1 AND id != $2',
      [newSku, id]
    );
    const currentStock = parseInt(stockResult?.current_stock || '0');

    // Validate that stock won't go below 0
    if (currentStock + newQty < 0) {
      throw new Error(
        `Transaction would result in negative stock. Current: ${currentStock}, Requested: ${newQty}`
      );
    }

    // Calculate new amount
    const amount = product.price * Math.abs(newQty);

    const query = `
      UPDATE adjustment_transactions 
      SET sku = $1, qty = $2, amount = $3
      WHERE id = $4
      RETURNING *
    `;

    return await db.one(query, [newSku, newQty, amount, id]);
  }

  async deleteAdjustmentTransaction(id: number): Promise<boolean> {
    const result = await db.result('DELETE FROM adjustment_transactions WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}
