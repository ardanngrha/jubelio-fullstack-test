import { create } from 'zustand';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/api';
import { Product, ProductPayload } from '@/types';

interface ProductState {
  products: Product[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  searchQuery: string;
  fetchProducts: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  addProduct: (product: ProductPayload) => Promise<void>;
  updateProduct: (sku: string, product: ProductPayload) => Promise<void>;
  removeProduct: (sku: string) => Promise<void>;
  reset: () => void;
}

const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  searchQuery: '',

  fetchProducts: async () => {
    const { page, hasMore, searchQuery, isLoading } = get();
    if (isLoading || !hasMore) return;

    set({ isLoading: true });
    try {
      const { products: newProducts, hasMore: newHasMore } = await getProducts(
        page,
        8,
        searchQuery,
      );
      set((state) => ({
        products:
          page === 1 ? newProducts : [...state.products, ...newProducts],
        page: state.page + 1,
        hasMore: newHasMore,
      }));
    } catch (error) {
      console.error('Failed to fetch products', error);
      set({ hasMore: false }); // Stop fetching on error
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query: string) => {
    get().reset();
    set({ searchQuery: query });
    get().fetchProducts();
  },

  addProduct: async (productData: ProductPayload) => {
    const newProduct = await createProduct(productData);
    set((state) => ({ products: [newProduct, ...state.products] }));
  },

  updateProduct: async (sku: string, productData: ProductPayload) => {
    const updatedProduct = await updateProduct(sku, productData);
    set((state) => ({
      products: state.products.map((p) => (p.sku === sku ? updatedProduct : p)),
    }));
  },

  removeProduct: async (sku: string) => {
    await deleteProduct(sku);
    set((state) => ({
      products: state.products.filter((p) => p.sku !== sku),
    }));
  },

  reset: () => set({ products: [], page: 1, hasMore: true }),
}));

export default useProductStore;
