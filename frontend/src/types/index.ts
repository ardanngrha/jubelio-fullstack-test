export interface Product {
  id: number;
  title: string;
  sku: string;
  image: string;
  price: number;
  description: string;
  stock: number;
}

export interface AdjustmentTransaction {
  id: number;
  sku: string;
  qty: number;
  amount: number;
}

export type ProductPayload = Omit<Product, 'id' | 'stock'>;
export type AdjustmentPayload = Omit<AdjustmentTransaction, 'id' | 'amount'>;
