export interface AdjustmentTransaction {
  id?: number;
  sku: string;
  qty: number;
  amount: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AdjustmentTransactionQuery {
  page?: number;
  limit?: number;
  sku?: string;
}
