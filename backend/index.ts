import fastify from 'fastify';
import cors from '@fastify/cors';
import { productRoutes } from './src/routes/products.ts';
import { adjustmentRoutes } from './src/routes/adjustmentTransactions.ts';

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
  console.error(error);
  reply.status(500).send({ error: 'Something went wrong' });
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
