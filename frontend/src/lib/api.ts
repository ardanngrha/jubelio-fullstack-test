import {
  Product,
  AdjustmentTransaction,
  ProductPayload,
  AdjustmentPayload,
} from '@/types';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';

// Product API Calls
export const getProducts = async (
  page: number,
  limit: number,
  search?: string,
): Promise<{
  products: Product[];
  totalPages: number;
  totalProducts: number;
}> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    query.set('search', search);
  }
  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return {
    products: data.data,
    totalPages: data.pagination.totalPages,
    totalProducts: data.pagination.total,
  };
};

export const importProducts = async (): Promise<{
  message: string;
  inserted: number;
  skipped: number;
  skippedSKUs: string[];
}> => {
  const res = await fetch(`${API_BASE_URL}/products/import`);
  if (!res.ok) throw new Error('Failed to fetch products from dummyjson');
  const data = await res.json();

  return data;
};

export const createProduct = async (
  product: ProductPayload,
): Promise<Product> => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
};

export const updateProduct = async (
  sku: string,
  product: ProductPayload,
): Promise<Product> => {
  const res = await fetch(`${API_BASE_URL}/products/${sku}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
};

export const deleteProduct = async (sku: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/products/${sku}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete product');
};

// Adjustment API Calls
export const getAdjustments = async (
  page: number,
  limit: number,
  sku?: string,
): Promise<{
  adjustments: AdjustmentTransaction[];
  totalPages: number;
  totalAdjustments: number;
}> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (sku) {
    query.set('search', sku);
  }
  const res = await fetch(`${API_BASE_URL}/adjustments?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch adjustments');
  const data = await res.json();
  return {
    adjustments: data.data,
    totalPages: data.pagination.totalPages,
    totalAdjustments: data.pagination.total,
  };
};

export const createAdjustment = async (
  adjustment: AdjustmentPayload,
): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/adjustments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustment),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create adjustment');
  }
  return data;
};

export const updateAdjustment = async (
  id: number,
  adjustment: AdjustmentPayload,
): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustment),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update adjustment');
  }
  return data;
};

export const deleteAdjustment = async (id: number): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete adjustment');
  }
  return data;
};
