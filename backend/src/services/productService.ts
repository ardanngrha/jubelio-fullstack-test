import type { ProductRepository } from '../repositories/productRepository.ts';
import type { Product, ProductWithStock, ProductQuery } from '../models/Product.ts';
import type { PaginatedResponse } from '../utils/pagination.ts';
import { fetchProductsFromDummyJson } from '../utils/dummyJson.ts';

export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async getProducts(query: ProductQuery): Promise<PaginatedResponse<ProductWithStock>> {
    return this.productRepository.getProducts(query);
  }

  async getProductBySku(sku: string): Promise<ProductWithStock | null> {
    return this.productRepository.getProductBySku(sku);
  }

  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    return this.productRepository.createProduct(productData);
  }

  async updateProduct(
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Product | null> {
    return this.productRepository.updateProduct(updates);
  }

  async deleteProduct(sku: string): Promise<boolean> {
    return this.productRepository.deleteProduct(sku);
  }

  async importProductsFromDummyJson(): Promise<{
    message: string;
    inserted: number;
    skipped: number;
    skippedSKUs: string[];
  }> {
    const products = await fetchProductsFromDummyJson();
    const result = await this.productRepository.importProducts(products);
    return {
      message: 'Import completed',
      ...result,
    };
  }
}
