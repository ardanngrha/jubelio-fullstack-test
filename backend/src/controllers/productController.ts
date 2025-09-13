import type { FastifyReply, FastifyRequest } from 'fastify';
import db from '../database/connection.ts';
import type { Product, ProductWithStock, ProductQuery } from '../models/Product.ts';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination.ts';
import { fetchProductsFromDummyJson } from '../utils/dummyJson.ts';

export async function getProducts(
  request: FastifyRequest<{ Querystring: ProductQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { page, limit, search } = request.query;
    const { page: validPage, limit: validLimit } = getPaginationParams(page, limit);
    const offset = (validPage - 1) * validLimit;

    let whereClause = '';
    const params: unknown[] = [validLimit, offset];

    if (search) {
      whereClause = 'WHERE p.title ILIKE $3 OR p.sku ILIKE $3';
      params.push(`%${search}%`);
    }

    const query = `
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
      ${whereClause}
    `;

    const [products, countResult] = await Promise.all([
      db.any(query, params),
      db.one(
        search ? countQuery : 'SELECT COUNT(*) as total FROM products',
        search ? [`%${search}%`] : []
      ),
    ]);

    const response = createPaginatedResponse(
      products as ProductWithStock[],
      parseInt(countResult.total),
      validPage,
      validLimit
    );

    reply.send(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    reply.status(500).send({ error: 'Failed to fetch products' });
  }
}

export async function getProductDetail(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { sku } = request.params;

    const query = `
      SELECT 
        p.*,
        COALESCE(SUM(at.qty), 0) as stock
      FROM products p
      LEFT JOIN adjustment_transactions at ON p.sku = at.sku
      WHERE p.sku = $1
      GROUP BY p.id, p.title, p.sku, p.image, p.price, p.description, p.created_at, p.updated_at
    `;

    const product = await db.oneOrNone(query, [sku]);

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    reply.send(product);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    reply.status(500).send({ error: 'Failed to fetch product detail' });
  }
}

export async function createProduct(
  request: FastifyRequest<{
    Body: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
  }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { title, sku, image, price, description } = request.body;

    const query = `
      INSERT INTO products (title, sku, image, price, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const product = await db.one(query, [title, sku, image, price, description]);
    reply.status(201).send(product);
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      // Unique violation
      reply.status(409).send({ error: 'SKU already exists' });
    } else {
      reply.status(500).send({ error: 'Failed to create product' });
    }
  }
}

export async function updateProduct(
  request: FastifyRequest<{
    Params: { sku: string };
    Body: Partial<Omit<Product, 'id' | 'sku' | 'created_at' | 'updated_at'>>;
  }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { sku } = request.params;
    const updates = request.body;

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [sku, ...Object.values(updates)];

    const query = `
      UPDATE products 
      SET ${setClause}
      WHERE sku = $1
      RETURNING *
    `;

    const product = await db.oneOrNone(query, values);

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    reply.send(product);
  } catch (error) {
    console.error('Error updating product:', error);
    reply.status(500).send({ error: 'Failed to update product' });
  }
}

export async function deleteProduct(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { sku } = request.params;

    const result = await db.result('DELETE FROM products WHERE sku = $1', [sku]);

    if (result.rowCount === 0) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    reply.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    reply.status(500).send({ error: 'Failed to delete product' });
  }
}

export async function importProductsFromDummyJson(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
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

    reply.send({
      message: 'Import completed',
      inserted: insertedProducts.length,
      skipped: skippedProducts.length,
      skippedSKUs: skippedProducts,
    });
  } catch (error) {
    console.error('Error importing products:', error);
    reply.status(500).send({ error: 'Failed to import products' });
  }
}
