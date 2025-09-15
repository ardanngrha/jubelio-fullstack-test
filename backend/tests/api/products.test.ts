// backend/tests/api/products.test.ts
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server.ts';
import { productsTableHelper } from '../helpers/productsTableHelper.ts';
import { adjustmentTableHelper } from '../helpers/adjustmentTransactionsTableHelper.ts';
import db from '../../src/database/connection.ts';

describe('/products endpoint', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
    await db.$pool.end();
  });

  afterEach(async () => {
    await productsTableHelper.clearProducts();
    await adjustmentTableHelper.clearAdjustments();
  });

  describe('when GET /products', () => {
    it('should respond 200 and an array of products', async () => {
      // Arrange
      const product1 = await productsTableHelper.addProduct({
        sku: 'TEST-001',
        price: 100,
      });
      const product2 = await productsTableHelper.addProduct({
        sku: 'TEST-002',
        price: 200,
      });

      // Action
      const response = await supertest(server.server).get('/api/products');

      // Assert
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: product1.id,
            sku: product1.sku,
          }),
          expect.objectContaining({
            id: product2.id,
            sku: product2.sku,
          }),
        ])
      );
    });
  });

  describe('when GET /products/:sku', () => {
    it('should respond 200 and the product details', async () => {
      // Arrange
      const product = await productsTableHelper.addProduct({
        sku: 'TEST-001',
        title: 'Test Product',
        price: 100,
      });

      // Action
      const response = await supertest(server.server).get(`/api/products/${product.sku}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.sku).toEqual(product.sku);
      expect(response.body.title).toEqual(product.title);
    });

    it('should respond 404 when product not found', async () => {
      // Action
      const response = await supertest(server.server).get('/api/products/NON-EXISTENT-SKU');

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when POST /products', () => {
    it('should respond 201 and the created product', async () => {
      // Arrange
      const requestPayload = {
        title: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        description: 'This is a test product.',
        image: 'http://example.com/image.jpg',
      };

      // Action
      const response = await supertest(server.server).post('/api/products').send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      const responseJson = response.body.data;
      expect(responseJson.id).toBeDefined();
      expect(responseJson.title).toEqual(requestPayload.title);
      expect(responseJson.sku).toEqual(requestPayload.sku);
      expect(responseJson.price).toEqual(String(requestPayload.price));
      expect(responseJson.description).toEqual(requestPayload.description);
      expect(responseJson.image).toEqual(requestPayload.image);
    });

    it('should respond 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Test Product',
      };

      // Action
      const response = await supertest(server.server).post('/api/products').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('should respond 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'Test Product',
        sku: 'TEST-001',
        price: 'a string, not a number',
      };

      // Action
      const response = await supertest(server.server).post('/api/products').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('should respond 409 when SKU already exists', async () => {
      // Arrange
      await productsTableHelper.addProduct({ sku: 'TEST-001' });
      const requestPayload = {
        title: 'Another Product',
        sku: 'TEST-001',
        price: 199.99,
      };

      // Action
      const response = await supertest(server.server).post('/api/products').send(requestPayload);

      // Assert
      expect(response.status).toEqual(409);
      expect(response.body.message).toEqual('SKU already exists');
    });
  });

  describe('when PUT /products/:sku', () => {
    it('should respond 200 and the updated product', async () => {
      // Arrange
      const product = await productsTableHelper.addProduct({ sku: 'TEST-001' });
      const requestPayload = {
        title: 'Updated Product Title',
        price: 150.0,
      };

      // Action
      const response = await supertest(server.server)
        .put(`/api/products/${product.sku}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.title).toEqual(requestPayload.title);
      expect(response.body.price).toEqual(requestPayload.price.toFixed(2));
    });

    it('should respond 404 when product to update is not found', async () => {
      // Arrange
      const requestPayload = {
        title: 'Updated Product Title',
      };

      // Action
      const response = await supertest(server.server)
        .put('/api/products/NON-EXISTENT-SKU')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when DELETE /products/:sku', () => {
    it('should respond 200 and a success message', async () => {
      // Arrange
      const product = await productsTableHelper.addProduct({ sku: 'TEST-001' });

      // Action
      const response = await supertest(server.server).delete(`/api/products/${product.sku}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Product deleted successfully');
    });

    it('should respond 404 when product to delete is not found', async () => {
      // Action
      const response = await supertest(server.server).delete('/api/products/NON-EXISTENT-SKU');

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when GET /products/import', () => {
    it('should respond 200 and import products', async () => {
      // Action
      const response = await supertest(server.server).get('/api/products/import');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Import completed');
      expect(response.body.inserted).toBeGreaterThan(0);
    });
  });
});
