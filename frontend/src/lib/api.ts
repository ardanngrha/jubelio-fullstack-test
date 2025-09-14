import {
  Product,
  AdjustmentTransaction,
  ProductPayload,
  AdjustmentPayload,
} from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';

// Product API Calls
export const getProducts = async (
  page: number,
  limit: number,
  search?: string,
): Promise<{ products: Product[]; hasMore: boolean }> => {
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
  console.log(data);
  return {
    products: data.data,
    hasMore: data.pagination.total === limit,
  };
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
): Promise<{ adjustments: AdjustmentTransaction[]; totalPages: number }> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE_URL}/adjustments?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch adjustments');
  const data = await res.json();
  console.log(data);
  return {
    adjustments: data.data,
    totalPages: data.pagination.totalPages,
  };
};

export const createAdjustment = async (
  adjustment: AdjustmentPayload,
): Promise<AdjustmentTransaction> => {
  const res = await fetch(`${API_BASE_URL}/adjustments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustment),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create adjustment');
  }
  return res.json();
};

export const updateAdjustment = async (
  id: number,
  adjustment: AdjustmentPayload,
): Promise<AdjustmentTransaction> => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustment),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update adjustment');
  }
  return res.json();
};

export const deleteAdjustment = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete adjustment');
};
