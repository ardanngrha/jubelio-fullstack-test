import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Product, ProductQuery } from '../models/Product.ts';
import type { ProductService } from '../services/productService.ts';

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  getProducts = async (
    request: FastifyRequest<{ Querystring: ProductQuery }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const response = await this.productService.getProducts(request.query);
      reply.send(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      reply
        .status(500)
        .send({ error: 'Failed to fetch products', message: (error as Error).message });
    }
  };

  getProductDetail = async (
    request: FastifyRequest<{ Params: { sku: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { sku } = request.params;
      const product = await this.productService.getProductBySku(sku);

      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      reply.send(product);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      reply
        .status(500)
        .send({ error: 'Failed to fetch product detail', message: (error as Error).message });
    }
  };

  createProduct = async (
    request: FastifyRequest<{
      Body: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const product = await this.productService.createProduct(request.body);
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
        reply
          .status(500)
          .send({ error: 'Failed to create product', message: (error as Error).message });
      }
    }
  };

  updateProduct = async (
    request: FastifyRequest<{
      Body: Partial<Omit<Product, 'id' | 'sku' | 'created_at' | 'updated_at'>>;
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(request.body);

      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      reply.send(product);
    } catch (error) {
      console.error('Error updating product:', error);
      reply
        .status(500)
        .send({ error: 'Failed to update product', message: (error as Error).message });
    }
  };

  deleteProduct = async (
    request: FastifyRequest<{ Params: { sku: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { sku } = request.params;
      const deleted = await this.productService.deleteProduct(sku);

      if (!deleted) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      reply.status(200).send({
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      reply
        .status(500)
        .send({ error: 'Failed to delete product', message: (error as Error).message });
    }
  };

  importProductsFromDummyJson = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const result = await this.productService.importProductsFromDummyJson();
      reply.send(result);
    } catch (error) {
      console.error('Error importing products:', error);
      reply
        .status(500)
        .send({ error: 'Failed to import products', message: (error as Error).message });
    }
  };
}
