import db from '../../src/database/connection.ts';
import type { Product } from '../../src/models/Product.ts';

export const productsTableHelper = {
  async addProduct(productData: Partial<Product>): Promise<Product> {
    const {
      title = 'Test Product',
      sku = `TEST-${Date.now()}`,
      image = 'https://example.com/test.jpg',
      price = 99.99,
      description = 'Test description',
    } = productData;

    const query = `
      INSERT INTO products (title, sku, image, price, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.one(query, [title, sku, image, price, description]);
    return result;
  },

  async getProductBySku(sku: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE sku = $1';
    const result = await db.oneOrNone(query, [sku]);

    if (!result) return null;

    // Convert string numbers back to numbers
    return {
      ...result,
      price: parseFloat(result.price),
    };
  },

  async getAllProducts(): Promise<Product[]> {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    const results = await db.any(query);

    // Convert string numbers back to numbers
    return results.map((result) => ({
      ...result,
      price: parseFloat(result.price),
    }));
  },

  async updateProduct(sku: string, updates: Partial<Product>): Promise<Product | null> {
    const fields = Object.keys(updates).filter((key) => key !== 'sku');
    if (fields.length === 0) return this.getProductBySku(sku);

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [sku, ...fields.map((field) => updates[field as keyof Product])];

    const query = `
      UPDATE products 
      SET ${setClause}
      WHERE sku = $1
      RETURNING *
    `;

    const result = await db.oneOrNone(query, values);

    if (!result) return null;

    // Convert string numbers back to numbers
    return {
      ...result,
      price: parseFloat(result.price),
    };
  },

  async deleteProduct(sku: string): Promise<boolean> {
    const result = await db.result('DELETE FROM products WHERE sku = $1', [sku]);
    return result.rowCount > 0;
  },

  async clearProducts(): Promise<void> {
    await db.query('DELETE FROM products');
  },
};
