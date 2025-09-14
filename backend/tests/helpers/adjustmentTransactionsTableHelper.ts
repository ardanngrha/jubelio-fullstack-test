import db from '../../src/database/connection.ts';
import type { AdjustmentTransaction } from '../../src/models/AdjustmentTransaction.ts';

export const adjustmentTableHelper = {
  async addAdjustment(
    adjustmentData: Partial<AdjustmentTransaction>
  ): Promise<AdjustmentTransaction> {
    const { sku = 'TEST-SKU', qty = 10 } = adjustmentData;

    const query = `
      INSERT INTO adjustment_transactions (sku, qty)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await db.one(query, [sku, qty]);
    return result;
  },

  async getAdjustmentById(id: number): Promise<AdjustmentTransaction | null> {
    const query = 'SELECT * FROM adjustment_transactions WHERE id = $1';
    const result = await db.oneOrNone(query, [id]);

    if (!result) return null;

    // Convert string numbers back to numbers
    return {
      ...result,
      id: parseInt(result.id),
      qty: parseInt(result.qty),
    };
  },

  async getAdjustmentsBySku(sku: string): Promise<AdjustmentTransaction[]> {
    const query = 'SELECT * FROM adjustment_transactions WHERE sku = $1 ORDER BY created_at DESC';
    const results = await db.any(query, [sku]);

    // Convert string numbers back to numbers
    return results.map((result) => ({
      ...result,
      id: parseInt(result.id),
      qty: parseInt(result.qty),
    }));
  },

  async getAllAdjustments(): Promise<AdjustmentTransaction[]> {
    const query = 'SELECT * FROM adjustment_transactions ORDER BY created_at DESC';
    const results = await db.any(query);

    // Convert string numbers back to numbers
    return results.map((result) => ({
      ...result,
      id: parseInt(result.id),
      qty: parseInt(result.qty),
    }));
  },

  async updateAdjustment(
    id: number,
    updates: Partial<AdjustmentTransaction>
  ): Promise<AdjustmentTransaction | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at'
    );
    if (fields.length === 0) return this.getAdjustmentById(id);

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map((field) => updates[field as keyof AdjustmentTransaction])];

    const query = `
      UPDATE adjustment_transactions 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.oneOrNone(query, values);

    if (!result) return null;

    // Convert string numbers back to numbers
    return {
      ...result,
      id: parseInt(result.id),
      qty: parseInt(result.qty),
    };
  },

  async deleteAdjustment(id: number): Promise<boolean> {
    const result = await db.result('DELETE FROM adjustment_transactions WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  async deleteAdjustmentsBySku(sku: string): Promise<number> {
    const result = await db.result('DELETE FROM adjustment_transactions WHERE sku = $1', [sku]);
    return result.rowCount;
  },

  async getStockForProduct(sku: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(qty), 0) as stock 
      FROM adjustment_transactions 
      WHERE sku = $1
    `;
    const result = await db.oneOrNone(query, [sku]);
    return Number(result?.stock || 0);
  },

  async clearAdjustments(): Promise<void> {
    await db.query('DELETE FROM adjustment_transactions');
  },
};
