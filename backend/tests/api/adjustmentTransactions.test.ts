// backend/tests/api/adjustmentTransactions.test.ts
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server.ts';
import { productsTableHelper } from '../helpers/productsTableHelper.ts';
import { adjustmentTableHelper } from '../helpers/adjustmentTransactionsTableHelper.ts';
import type { Product } from '../../src/models/Product.ts';
// import type { AdjustmentTransaction } from '../../src/models/AdjustmentTransaction.ts';
import db from '../../src/database/connection.ts';

describe('/adjustments endpoint', () => {
  let server: FastifyInstance;
  let product: Product;

  beforeAll(async () => {
    server = buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
    await db.$pool.end();
  });

  beforeEach(async () => {
    product = await productsTableHelper.addProduct({
      sku: 'ADJ-TEST-001',
      price: 100,
    });
  });

  afterEach(async () => {
    await adjustmentTableHelper.clearAdjustments();
    await productsTableHelper.clearProducts();
  });

  describe('when GET /adjustments', () => {
    it('should respond 200 and an array of adjustments', async () => {
      // Arrange
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

  describe('when GET /adjustments/:id', () => {
    it('should respond 200 and a single adjustment transaction', async () => {
      // Arrange
      const adjustment = await adjustmentTableHelper.addAdjustment({
        sku: product.sku,
        qty: 10,
      });

      // Action
      const response = await supertest(server.server).get(`/api/adjustments/${adjustment.id}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(adjustment.id);
      expect(response.body.sku).toEqual(adjustment.sku);
    });

    it('should respond 404 when the adjustment transaction is not found', async () => {
      // Action
      const response = await supertest(server.server).get('/api/adjustments/9999');

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when POST /adjustments', () => {
    it('should respond 201 and persisted adjustment', async () => {
      // Arrange
      const requestPayload = {
        sku: product.sku,
        qty: 10,
      };

      // Action
      const response = await supertest(server.server).post('/api/adjustments').send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      const responseJson = response.body;
      expect(responseJson.id).toBeDefined();
      expect(responseJson.sku).toEqual(requestPayload.sku);
      expect(responseJson.qty).toEqual(requestPayload.qty);
      expect(responseJson.amount).toEqual((product.price * requestPayload.qty).toFixed(2));
    });

    it('should respond 404 when product not found', async () => {
      // Arrange
      const requestPayload = {
        sku: 'NON-EXISTENT',
        qty: 10,
      };

      // Action
      const response = await supertest(server.server).post('/api/adjustments').send(requestPayload);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.error).toEqual('Product not found');
    });

    it('should respond 400 when transaction would result in negative stock', async () => {
      // Arrange
      await adjustmentTableHelper.addAdjustment({ sku: product.sku, qty: 5 });
      const requestPayload = {
        sku: product.sku,
        qty: -10,
      };

      // Action
      const response = await supertest(server.server).post('/api/adjustments').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('negative stock');
    });
  });

  describe('when PUT /adjustments/:id', () => {
    it('should respond 200 and the updated transaction', async () => {
      // Arrange
      const adjustment = await adjustmentTableHelper.addAdjustment({
        sku: product.sku,
        qty: 10,
      });
      const requestPayload = {
        qty: 20,
      };

      // Action
      const response = await supertest(server.server)
        .put(`/api/adjustments/${adjustment.id}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.qty).toEqual(requestPayload.qty);
    });

    it('should respond 404 when the transaction is not found', async () => {
      // Arrange
      const requestPayload = {
        qty: 20,
      };

      // Action
      const response = await supertest(server.server)
        .put('/api/adjustments/9999')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when DELETE /adjustments/:id', () => {
    it('should respond 200 and a success message', async () => {
      // Arrange
      const adjustment = await adjustmentTableHelper.addAdjustment({
        sku: product.sku,
        qty: 10,
      });

      // Action
      const response = await supertest(server.server).delete(`/api/adjustments/${adjustment.id}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Adjustment transaction deleted successfully');
    });

    it('should respond 404 when the transaction is not found', async () => {
      // Action
      const response = await supertest(server.server).delete('/api/adjustments/9999');

      // Assert
      expect(response.status).toEqual(404);
    });
  });
});
