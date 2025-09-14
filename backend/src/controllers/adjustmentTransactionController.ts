import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AdjustmentTransactionQuery } from '../models/AdjustmentTransaction.ts';
import type { AdjustmentTransactionService } from '../services/adjustmentTransactionService.ts';

export class AdjustmentTransactionController {
  private adjustmentTransactionService: AdjustmentTransactionService;

  constructor(adjustmentTransactionService: AdjustmentTransactionService) {
    this.adjustmentTransactionService = adjustmentTransactionService;
  }

  getAdjustmentTransactions = async (
    request: FastifyRequest<{ Querystring: AdjustmentTransactionQuery }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const response = await this.adjustmentTransactionService.getAdjustmentTransactions(
        request.query
      );
      reply.send(response);
    } catch (error) {
      reply.status(500).send({
        error: 'Failed to fetch adjustment transactions',
        message: (error as Error).message,
      });
    }
  };

  getAdjustmentTransactionDetail = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      const transaction = await this.adjustmentTransactionService.getAdjustmentTransactionById(
        parseInt(id)
      );

      if (!transaction) {
        return reply.status(404).send({ error: 'Transaction not found' });
      }

      reply.send(transaction);
    } catch (error) {
      reply
        .status(500)
        .send({ error: 'Failed to fetch transaction detail', message: (error as Error).message });
    }
  };

  createAdjustmentTransaction = async (
    request: FastifyRequest<{ Body: { sku: string; qty: number } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { sku, qty } = request.body;
      const transaction = await this.adjustmentTransactionService.createAdjustmentTransaction(
        sku,
        qty
      );
      reply.status(201).send(transaction);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          return reply.status(404).send({ error: error.message });
        }
        if (error.message.includes('negative stock')) {
          return reply.status(400).send({ error: error.message });
        }
      }

      reply.status(500).send({
        error: 'Failed to create adjustment transaction',
        message: (error as Error).message,
      });
    }
  };

  updateAdjustmentTransaction = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { sku?: string; qty?: number };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      const { sku, qty } = request.body;

      const transaction = await this.adjustmentTransactionService.updateAdjustmentTransaction(
        parseInt(id),
        sku,
        qty
      );

      reply.send(transaction);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Transaction not found' || error.message === 'Product not found') {
          return reply.status(404).send({ error: error.message });
        }
        if (error.message.includes('negative stock')) {
          return reply.status(400).send({ error: error.message });
        }
      }

      reply.status(500).send({
        error: 'Failed to update adjustment transaction',
        message: (error as Error).message,
      });
    }
  };

  deleteAdjustmentTransaction = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      const deleted = await this.adjustmentTransactionService.deleteAdjustmentTransaction(
        parseInt(id)
      );

      if (!deleted) {
        return reply.status(404).send({ error: 'Transaction not found' });
      }

      reply.status(200).send({ message: 'Adjustment transaction deleted successfully' });
    } catch (error) {
      reply.status(500).send({
        error: 'Failed to delete adjustment transaction',
        message: (error as Error).message,
      });
    }
  };
}
