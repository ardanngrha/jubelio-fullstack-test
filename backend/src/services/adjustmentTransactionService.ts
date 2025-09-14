import type { AdjustmentTransactionRepository } from '../repositories/adjustmentTransactionRepository.ts';
import type { ProductRepository } from '../repositories/productRepository.ts';
import type {
  AdjustmentTransaction,
  AdjustmentTransactionQuery,
} from '../models/AdjustmentTransaction.ts';
import type { PaginatedResponse } from '../utils/pagination.ts';

export class AdjustmentTransactionService {
  private adjustmentTransactionRepository: AdjustmentTransactionRepository;
  private productRepository: ProductRepository;

  constructor(
    adjustmentTransactionRepository: AdjustmentTransactionRepository,
    productRepository: ProductRepository
  ) {
    this.adjustmentTransactionRepository = adjustmentTransactionRepository;
    this.productRepository = productRepository;
  }

  async getAdjustmentTransactions(
    query: AdjustmentTransactionQuery
  ): Promise<PaginatedResponse<AdjustmentTransaction>> {
    return this.adjustmentTransactionRepository.getAdjustmentTransactions(query);
  }

  async getAdjustmentTransactionById(id: number): Promise<AdjustmentTransaction | null> {
    return this.adjustmentTransactionRepository.getAdjustmentTransactionById(id);
  }

  async createAdjustmentTransaction(sku: string, qty: number): Promise<AdjustmentTransaction> {
    const product = await this.productRepository.getProductBySku(sku);
    if (!product) {
      throw new Error('Product not found');
    }

    const currentStock = await this.adjustmentTransactionRepository.getCurrentStock(sku);

    if (currentStock + qty < 0) {
      throw new Error(
        `Transaction would result in negative stock. Current: ${currentStock}, Requested: ${qty}`
      );
    }

    return this.adjustmentTransactionRepository.createAdjustmentTransaction(sku, qty);
  }

  async updateAdjustmentTransaction(
    id: number,
    sku?: string,
    qty?: number
  ): Promise<AdjustmentTransaction> {
    const currentTransaction =
      await this.adjustmentTransactionRepository.getAdjustmentTransactionById(id);

    if (!currentTransaction) {
      throw new Error('Transaction not found');
    }

    const newSku = sku || currentTransaction.sku;
    const newQty = qty !== undefined ? qty : currentTransaction.qty;

    const product = await this.productRepository.getProductBySku(newSku);
    if (!product) {
      throw new Error('Product not found');
    }

    const currentStock = await this.adjustmentTransactionRepository.getCurrentStock(newSku, id);

    if (currentStock + newQty < 0) {
      throw new Error(
        `Transaction would result in negative stock. Current: ${currentStock}, Requested: ${newQty}`
      );
    }

    return this.adjustmentTransactionRepository.updateAdjustmentTransaction(id, newSku, newQty);
  }

  async deleteAdjustmentTransaction(id: number): Promise<boolean> {
    return this.adjustmentTransactionRepository.deleteAdjustmentTransaction(id);
  }
}
