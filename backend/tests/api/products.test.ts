// backend/tests/api/products.test.ts
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server.ts';
import { productsTableHelper } from '../helpers/productsTableHelper.ts';
import { adjustmentTableHelper } from '../helpers/adjustmentTransactionsTableHelper.ts';
import db from '../../src/database/connection.ts';

describe('/products endpoint', () => {
  afterAll(async () => {
    await db.$pool.end();
  });

  afterEach(async () => {
    await productsTableHelper.clearProducts();
    await adjustmentTableHelper.clearAdjustments();
  });

  describe('when GET /products', () => {
    it('should respond 200 and an array of products', async () => {
      const server: FastifyInstance = buildServer();
      await server.ready();

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

  // describe('when POST /products', () => {
  //   it('should respond 201 and persisted product', async () => {
  //     // Arrange
  //     const requestPayload = {
  //       title: 'Test Product',
  //       sku: 'TEST-001',
  //       price: 99.99,
  //       description: 'This is a test product.',
  //       image: 'http://example.com/image.jpg',
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/products').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(201);
  //     const responseJson = response.body;
  //     expect(responseJson.id).toBeDefined();
  //     expect(responseJson.title).toEqual(requestPayload.title);
  //     expect(responseJson.sku).toEqual(requestPayload.sku);
  //     expect(responseJson.price).toEqual(String(requestPayload.price));
  //     expect(responseJson.description).toEqual(requestPayload.description);
  //     expect(responseJson.image).toEqual(requestPayload.image);
  //   });

  //   it('should respond 400 when request payload not contain needed property', async () => {
  //     // Arrange
  //     const requestPayload = {
  //       title: 'Test Product',
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/products').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(400);
  //   });

  //   it('should respond 400 when request payload not meet data type specification', async () => {
  //     // Arrange
  //     const requestPayload = {
  //       title: 'Test Product',
  //       sku: 'TEST-001',
  //       price: 'a string, not a number',
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/products').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(400);
  //   });

  //   it('should respond 409 when SKU already exists', async () => {
  //     // Arrange
  //     await productsTableHelper.addProduct({ sku: 'TEST-001' });
  //     const requestPayload = {
  //       title: 'Another Product',
  //       sku: 'TEST-001',
  //       price: 199.99,
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/products').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(409);
  //     expect(response.body.error).toEqual('SKU already exists');
  //   });
  // });
});
