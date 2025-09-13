export interface Product {
  id?: number;
  title: string;
  sku: string;
  image?: string;
  price: number;
  description?: string;
  stock?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductWithStock extends Product {
  stock: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
}
