import type { FastifyInstance } from 'fastify';
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  importProductsFromDummyJson,
} from '../controllers/productController.ts';

export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // Get products with pagination
  fastify.get('/products', getProducts);

  // Get product detail by SKU
  fastify.get('/products/:sku', getProductDetail);

  // Create new product
  fastify.post(
    '/products',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'sku', 'price'],
          properties: {
            title: { type: 'string' },
            sku: { type: 'string' },
            image: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
          },
        },
      },
    },
    createProduct
  );

  // Update product by SKU
  fastify.put(
    '/products/:sku',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            image: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
          },
        },
      },
    },
    updateProduct
  );

  // Delete product by SKU
  fastify.delete('/products/:sku', deleteProduct);

  // Import products from DummyJSON
  fastify.post('/products/import', importProductsFromDummyJson);
}
