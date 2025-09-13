import type { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/productController.ts';

const productController = new ProductController();

export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // Get products with pagination
  fastify.get('/products', productController.getProducts);

  // Get product detail by SKU
  fastify.get('/products/:sku', productController.getProductDetail);

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
    productController.createProduct
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
    productController.updateProduct
  );

  // Delete product by SKU
  fastify.delete('/products/:sku', productController.deleteProduct);

  // Import products from DummyJSON
  fastify.post('/products/import', productController.importProductsFromDummyJson);
}
