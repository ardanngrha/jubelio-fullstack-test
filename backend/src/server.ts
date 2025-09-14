import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { productRoutes } from './routes/products.ts';
import { adjustmentRoutes } from './routes/adjustmentTransactions.ts';

export function buildServer(): FastifyInstance {
  const server = fastify({
    logger: true,
  });

  // Register CORS
  server.register(cors, {
    origin: true,
  });

  // Health check endpoint
  server.get('/ping', async () => {
    return 'pong\n';
  });

  // Register routes
  server.register(productRoutes, { prefix: '/api' });
  server.register(adjustmentRoutes, { prefix: '/api' });

  // Global error handler
  server.setErrorHandler(function (error, request, reply) {
    if (error.validation) {
      reply.status(400).send(error);
      return;
    }
    console.error(error);
    reply.status(500).send({ error: 'Something went wrong' });
  });

  return server;
}
