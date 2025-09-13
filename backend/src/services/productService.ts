import db from '../database/connection.ts';
import type { Product, ProductWithStock, ProductQuery } from '../models/Product.ts';
import {
  getPaginationParams,
  createPaginatedResponse,
  type PaginatedResponse,
} from '../utils/pagination.ts';
import { fetchProductsFromDummyJson } from '../utils/dummyJson.ts';

export class ProductService {
  async getProducts(query: ProductQuery): Promise<PaginatedResponse<ProductWithStock>> {
    const { page, limit, search } = query;
    const { page: validPage, limit: validLimit } = getPaginationParams(page, limit);
    const offset = (validPage - 1) * validLimit;

    let whereClause = '';
    let countWhereClause = '';
    const params: unknown[] = [validLimit, offset];
    const countParams: unknown[] = [];

    if (search) {
      whereClause = 'WHERE p.title ILIKE $3 OR p.sku ILIKE $3';
      countWhereClause = 'WHERE p.title ILIKE $1 OR p.sku ILIKE $1';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    const productQuery = `
    SELECT 
      p.*,
      COALESCE(SUM(at.qty), 0) as stock
    FROM products p
    LEFT JOIN adjustment_transactions at ON p.sku = at.sku
    ${whereClause}
    GROUP BY p.id, p.title, p.sku, p.image, p.price, p.description, p.created_at, p.updated_at
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;

    const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    ${countWhereClause}
  `;

    const [products, countResult] = await Promise.all([
      db.any(productQuery, params),
      db.one(
        search ? countQuery : 'SELECT COUNT(*) as total FROM products',
        search ? countParams : []
      ),
    ]);

    return createPaginatedResponse(
      products as ProductWithStock[],
      parseInt(countResult.total),
      validPage,
      validLimit
    );
  }

  async getProductBySku(sku: string): Promise<ProductWithStock | null> {
    const query = `
      SELECT 
        p.*,
        COALESCE(SUM(at.qty), 0) as stock
      FROM products p
      LEFT JOIN adjustment_transactions at ON p.sku = at.sku
      WHERE p.sku = $1
      GROUP BY p.id, p.title, p.sku, p.image, p.price, p.description, p.created_at, p.updated_at
    `;

    return await db.oneOrNone(query, [sku]);
  }

  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    const { title, sku, image, price, description } = productData;

    const query = `
      INSERT INTO products (title, sku, image, price, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    return await db.one(query, [title, sku, image, price, description]);
  }

  async updateProduct(
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Product | null> {
    if (!updates.sku) {
      throw new Error('SKU is required to update a product.');
    }

    const { sku, ...fieldsToUpdate } = updates;
    const setClause = Object.keys(fieldsToUpdate)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [sku, ...Object.values(fieldsToUpdate)];

    const query = `
      UPDATE products 
      SET ${setClause}
      WHERE sku = $1
      RETURNING *
    `;

    return await db.oneOrNone(query, values);
  }

  async deleteProduct(sku: string): Promise<boolean> {
    const result = await db.result('DELETE FROM products WHERE sku = $1', [sku]);
    return result.rowCount > 0;
  }

  async importProductsFromDummyJson(): Promise<{
    message: string;
    inserted: number;
    skipped: number;
    skippedSKUs: string[];
  }> {
    const products = await fetchProductsFromDummyJson();
    const insertedProducts: Product[] = [];
    const skippedProducts: string[] = [];

    for (const product of products) {
      try {
        const query = `
          INSERT INTO products (title, sku, image, price, description)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (sku) DO NOTHING
          RETURNING *
        `;

        const result = await db.oneOrNone(query, [
          product.title,
          product.sku,
          product.image,
          product.price,
          product.description,
        ]);

        if (result) {
          insertedProducts.push(result);
        } else {
          skippedProducts.push(product.sku);
        }
      } catch (error) {
        console.error(`Error inserting product ${product.sku}:`, error);
        skippedProducts.push(product.sku);
      }
    }

    return {
      message: 'Import completed',
      inserted: insertedProducts.length,
      skipped: skippedProducts.length,
      skippedSKUs: skippedProducts,
    };
  }
}
