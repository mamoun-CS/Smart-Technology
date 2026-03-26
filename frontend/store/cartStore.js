import { create } from 'zustand';
import { cartAPI } from '../lib/api';

export const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  total: 0,
  isLoading: false,
  error: null,

  // Get cart
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.getCart();
      const { cart, items, total } = response.data;
      set({ cart, items, total, isLoading: false });
      return { cart, items, total };
    } catch (error) {
      // Handle rate limiting (429) gracefully
      if (error.response?.status === 429) {
        console.warn('Rate limited, skipping cart fetch');
        set({ isLoading: false });
        return;
      }
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  // Add item to cart
  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.addItem({ product_id: productId, quantity });
      const { cart, items, total } = response.data;
      set({ cart, items, total, isLoading: false });
      return { cart, items, total };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  // Update item quantity
  updateItem: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.updateItem(productId, { quantity });
      const { cart, items, total } = response.data;
      set({ cart, items, total, isLoading: false });
      return { cart, items, total };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  // Remove item
  removeItem: async (productId) => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.removeItem(productId);
      const { cart, items, total } = response.data;
      set({ cart, items, total, isLoading: false });
      return { cart, items, total };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true });
    try {
      await cartAPI.clearCart();
      set({ cart: null, items: [], total: 0, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  // Get item count
  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useCartStore;