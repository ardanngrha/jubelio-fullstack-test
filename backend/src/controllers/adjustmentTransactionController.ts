import type { FastifyReply, FastifyRequest } from 'fastify';
import db from '../database/connection.ts';
import type {
  AdjustmentTransaction,
  AdjustmentTransactionQuery,
} from '../models/AdjusmentTransaction.ts';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination.ts';

export async function getAdjustmentTransactions(
  request: FastifyRequest<{ Querystring: AdjustmentTransactionQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { page, limit, sku } = request.query;
    const { page: validPage, limit: validLimit } = getPaginationParams(page, limit);
    const offset = (validPage - 1) * validLimit;

    let whereClause = '';
    const params: unknown[] = [validLimit, offset];

    if (sku) {
      whereClause = 'WHERE sku = $3';
      params.push(sku);
    }

    const query = `
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
      db.any(query, params),
      db.one(
        sku ? countQuery : 'SELECT COUNT(*) as total FROM adjustment_transactions',
        sku ? [sku] : []
      ),
    ]);

    const response = createPaginatedResponse(
      transactions as AdjustmentTransaction[],
      parseInt(countResult.total),
      validPage,
      validLimit
    );

    reply.send(response);
  } catch (error) {
    console.error('Error fetching adjustment transactions:', error);
    reply.status(500).send({ error: 'Failed to fetch adjustment transactions' });
  }
}

export async function getAdjustmentTransactionDetail(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    const transaction = await db.oneOrNone('SELECT * FROM adjustment_transactions WHERE id = $1', [
      parseInt(id),
    ]);

    if (!transaction) {
      return reply.status(404).send({ error: 'Transaction not found' });
    }

    reply.send(transaction);
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    reply.status(500).send({ error: 'Failed to fetch transaction detail' });
  }
}

export async function createAdjustmentTransaction(
  request: FastifyRequest<{ Body: { sku: string; qty: number } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { sku, qty } = request.body;

    // Check if product exists
    const product = await db.oneOrNone('SELECT * FROM products WHERE sku = $1', [sku]);
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    // Check current stock
    const stockResult = await db.oneOrNone(
      'SELECT COALESCE(SUM(qty), 0) as current_stock FROM adjustment_transactions WHERE sku = $1',
      [sku]
    );
    const currentStock = parseInt(stockResult?.current_stock || '0');

    // Validate that stock won't go below 0
    if (currentStock + qty < 0) {
      return reply.status(400).send({
        error: 'Transaction would result in negative stock',
        currentStock,
        requestedQty: qty,
      });
    }

    // Calculate amount
    const amount = product.price * Math.abs(qty);

    const query = `
      INSERT INTO adjustment_transactions (sku, qty, amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const transaction = await db.one(query, [sku, qty, amount]);
    reply.status(201).send(transaction);
  } catch (error) {
    console.error('Error creating adjustment transaction:', error);
    reply.status(500).send({ error: 'Failed to create adjustment transaction' });
  }
}

export async function updateAdjustmentTransaction(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { sku?: string; qty?: number };
  }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;
    const { sku, qty } = request.body;

    // Get current transaction
    const currentTransaction = await db.oneOrNone(
      'SELECT * FROM adjustment_transactions WHERE id = $1',
      [parseInt(id)]
    );

    if (!currentTransaction) {
      return reply.status(404).send({ error: 'Transaction not found' });
    }

    const newSku = sku || currentTransaction.sku;
    const newQty = qty !== undefined ? qty : currentTransaction.qty;

    // Check if product exists
    const product = await db.oneOrNone('SELECT * FROM products WHERE sku = $1', [newSku]);
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    // Check stock excluding current transaction
    const stockResult = await db.oneOrNone(
      'SELECT COALESCE(SUM(qty), 0) as current_stock FROM adjustment_transactions WHERE sku = $1 AND id != $2',
      [newSku, parseInt(id)]
    );
    const currentStock = parseInt(stockResult?.current_stock || '0');

    // Validate that stock won't go below 0
    if (currentStock + newQty < 0) {
      return reply.status(400).send({
        error: 'Transaction would result in negative stock',
        currentStock,
        requestedQty: newQty,
      });
    }

    // Calculate new amount
    const amount = product.price * Math.abs(newQty);

    const query = `
      UPDATE adjustment_transactions 
      SET sku = $1, qty = $2, amount = $3
      WHERE id = $4
      RETURNING *
    `;

    const transaction = await db.one(query, [newSku, newQty, amount, parseInt(id)]);
    reply.send(transaction);
  } catch (error) {
    console.error('Error updating adjustment transaction:', error);
    reply.status(500).send({ error: 'Failed to update adjustment transaction' });
  }
}

export async function deleteAdjustmentTransaction(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    const result = await db.result('DELETE FROM adjustment_transactions WHERE id = $1', [
      parseInt(id),
    ]);

    if (result.rowCount === 0) {
      return reply.status(404).send({ error: 'Transaction not found' });
    }

    reply.status(204).send();
  } catch (error) {
    console.error('Error deleting adjustment transaction:', error);
    reply.status(500).send({ error: 'Failed to delete adjustment transaction' });
  }
}
