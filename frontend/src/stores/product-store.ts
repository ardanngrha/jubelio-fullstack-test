import { create } from 'zustand';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
} from '@/lib/api';
import { Product, ProductPayload } from '@/types';

interface ProductState {
  products: Product[];
  page: number;
  totalPages: number;
  totalProducts: number;
  isLoading: boolean;
  searchQuery: string;
  fetchProducts: (page?: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  addProduct: (product: ProductPayload) => Promise<void>;
  updateProduct: (sku: string, product: ProductPayload) => Promise<void>;
  removeProduct: (sku: string) => Promise<void>;
  importProducts: () => Promise<{
    message: string;
    inserted: number;
    skipped: number;
    skippedSKUs: string[];
  }>;
  reset: () => void;
}

const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  page: 1,
  totalPages: 1,
  totalProducts: 0,
  isLoading: false,
  searchQuery: '',

  fetchProducts: async (page = 1) => {
    const { searchQuery, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const {
        products: newProducts,
        totalPages,
        totalProducts,
      } = await getProducts(page, 8, searchQuery);
      set((state) => ({
        products:
          page === 1 ? newProducts : [...state.products, ...newProducts],
        page,
        totalPages,
        totalProducts,
      }));

      if (newProducts.length === 0 && page > 1) {
        get().fetchProducts(page - 1);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, page: 1, products: [] });
    get().fetchProducts(1);
  },

  addProduct: async (productData: ProductPayload) => {
    await createProduct(productData);
    get().fetchProducts(1);
  },

  updateProduct: async (sku: string, productData: ProductPayload) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.sku === sku ? { ...p, ...productData } : p,
      ),
    }));
    await updateProduct(sku, productData);
    get().fetchProducts(get().page);
  },

  removeProduct: async (sku: string) => {
    set((state) => ({ products: state.products.filter((p) => p.sku !== sku) }));
    await deleteProduct(sku);
    get().fetchProducts(get().page);
  },

  importProducts: async () => {
    const result = await importProducts();
    get().fetchProducts(1);
    return result;
  },

  reset: () => set({ products: [], page: 1, totalPages: 1, totalProducts: 0 }),
}));

export default useProductStore;
