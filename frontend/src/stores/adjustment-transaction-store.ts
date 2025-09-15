import { create } from 'zustand';
import {
  getAdjustments,
  createAdjustment,
  updateAdjustment,
  deleteAdjustment,
} from '@/lib/api';
import { AdjustmentTransaction, AdjustmentPayload } from '@/types';

interface AdjustmentState {
  adjustments: AdjustmentTransaction[];
  page: number;
  totalPages: number;
  totalAdjustments: number;
  isLoading: boolean;
  searchQuery: string;
  fetchAdjustments: (page: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  addAdjustment: (adjustment: AdjustmentPayload) => Promise<void>;
  updateAdjustment: (
    id: number,
    adjustment: AdjustmentPayload,
  ) => Promise<void>;
  removeAdjustment: (id: number) => Promise<void>;
}

const useAdjustmentStore = create<AdjustmentState>((set, get) => ({
  adjustments: [],
  page: 1,
  totalPages: 1,
  totalAdjustments: 0,
  isLoading: false,
  searchQuery: '',

  fetchAdjustments: async (page: number) => {
    const { searchQuery } = get();
    set({ isLoading: true });
    try {
      const { adjustments, totalPages, totalAdjustments } =
        await getAdjustments(page, 10, searchQuery);
      set({ adjustments, totalPages, page, totalAdjustments });
    } catch (error) {
      console.error('Failed to fetch adjustments', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchAdjustments(1);
  },

  addAdjustment: async (adjustmentData: AdjustmentPayload) => {
    await createAdjustment(adjustmentData);
    get().fetchAdjustments(get().page);
  },

  updateAdjustment: async (id: number, adjustmentData: AdjustmentPayload) => {
    await updateAdjustment(id, adjustmentData);
    get().fetchAdjustments(get().page);
  },

  removeAdjustment: async (id: number) => {
    await deleteAdjustment(id);
    get().fetchAdjustments(get().page);
  },
}));

export default useAdjustmentStore;
