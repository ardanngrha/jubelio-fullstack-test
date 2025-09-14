// backend/tests/api/adjustmentTransactions.test.ts
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server.ts';
import { productsTableHelper } from '../helpers/productsTableHelper.ts';
import { adjustmentTableHelper } from '../helpers/adjustmentTransactionsTableHelper.ts';
import type { Product } from '../../src/models/Product.ts';
import db from '../../src/database/connection.ts';

describe('/adjustments endpoint', () => {
  afterAll(async () => {
    await db.$pool.end();
  });

  afterEach(async () => {
    await adjustmentTableHelper.clearAdjustments();
    await productsTableHelper.clearProducts();
  });

  describe('when GET /adjustments', () => {
    it('should respond 200 and an array of adjustments', async () => {
      const server: FastifyInstance = buildServer();
      await server.ready();

      // Arrange
      const product: Product = await productsTableHelper.addProduct({
        sku: 'ADJ-TEST-001',
        price: 100,
      });

      const adjustment1 = await adjustmentTableHelper.addAdjustment({
        sku: product.sku,
        qty: 10,
      });
      const adjustment2 = await adjustmentTableHelper.addAdjustment({
        sku: product.sku,
        qty: -5,
      });

      // Action
      const response = await supertest(server.server).get('/api/adjustments');

      // Assert
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: adjustment1.id,
            sku: adjustment1.sku,
            qty: adjustment1.qty,
            amount: (product.price * adjustment1.qty).toFixed(2),
          }),
          expect.objectContaining({
            id: adjustment2.id,
            sku: adjustment2.sku,
            qty: adjustment2.qty,
            amount: (product.price * adjustment2.qty).toFixed(2),
          }),
        ])
      );
    });
  });

  // describe('when POST /adjustments', () => {
  //   it('should respond 201 and persisted adjustment', async () => {
  //     // Arrange
  //     const requestPayload = {
  //       sku: product.sku,
  //       qty: 10,
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/adjustments').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(201);
  //     const responseJson = response.body;
  //     expect(responseJson.id).toBeDefined();
  //     expect(responseJson.sku).toEqual(requestPayload.sku);
  //     expect(responseJson.qty).toEqual(requestPayload.qty);
  //     // Ensure the amount is compared as a string with two decimal places
  //     expect(responseJson.amount).toEqual((product.price * requestPayload.qty).toFixed(2));
  //   });

  //   it('should respond 404 when product not found', async () => {
  //     // Arrange
  //     const requestPayload = {
  //       sku: 'NON-EXISTENT',
  //       qty: 10,
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/adjustments').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(404);
  //     expect(response.body.error).toEqual('Product not found');
  //   });

  //   it('should respond 400 when transaction would result in negative stock', async () => {
  //     // Arrange
  //     await adjustmentTableHelper.addAdjustment({ sku: product.sku, qty: 5 });
  //     const requestPayload = {
  //       sku: product.sku,
  //       qty: -10,
  //     };

  //     // Action
  //     const response = await supertest(server.server).post('/api/adjustments').send(requestPayload);

  //     // Assert
  //     expect(response.status).toEqual(400);
  //     expect(response.body.error).toContain('negative stock');
  //   });
  // });
});
