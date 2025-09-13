import type { FastifyInstance } from 'fastify';
import {
  getAdjustmentTransactions,
  getAdjustmentTransactionDetail,
  createAdjustmentTransaction,
  updateAdjustmentTransaction,
  deleteAdjustmentTransaction,
} from '../controllers/adjustmentTransactionController.ts';

export async function adjustmentRoutes(fastify: FastifyInstance): Promise<void> {
  // Get adjustment transactions with pagination
  fastify.get('/adjustments', getAdjustmentTransactions);

  // Get adjustment transaction detail by ID
  fastify.get('/adjustments/:id', getAdjustmentTransactionDetail);

  // Create new adjustment transaction
  fastify.post(
    '/adjustments',
    {
      schema: {
        body: {
          type: 'object',
          required: ['sku', 'qty'],
          properties: {
            sku: { type: 'string' },
            qty: { type: 'number' },
          },
        },
      },
    },
    createAdjustmentTransaction
  );

  // Update adjustment transaction by ID
  fastify.put(
    '/adjustments/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            sku: { type: 'string' },
            qty: { type: 'number' },
          },
        },
      },
    },
    updateAdjustmentTransaction
  );

  // Delete adjustment transaction by ID
  fastify.delete('/adjustments/:id', deleteAdjustmentTransaction);
}
