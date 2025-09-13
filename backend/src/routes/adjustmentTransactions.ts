import type { FastifyInstance } from 'fastify';
import { AdjustmentTransactionController } from '../controllers/adjustmentTransactionController.ts';

const adjustmentTransactionController = new AdjustmentTransactionController();

export async function adjustmentRoutes(fastify: FastifyInstance): Promise<void> {
  // Get adjustment transactions with pagination
  fastify.get('/adjustments', adjustmentTransactionController.getAdjustmentTransactions);

  // Get adjustment transaction detail by ID
  fastify.get('/adjustments/:id', adjustmentTransactionController.getAdjustmentTransactionDetail);

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
    adjustmentTransactionController.createAdjustmentTransaction
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
    adjustmentTransactionController.updateAdjustmentTransaction
  );

  // Delete adjustment transaction by ID
  fastify.delete('/adjustments/:id', adjustmentTransactionController.deleteAdjustmentTransaction);
}
