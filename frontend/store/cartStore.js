import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartAPI } from '@/lib';

// Custom storage that checks for window before accessing localStorage
const customStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      total: 0,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Set hydration flag
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

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
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ cart: state.cart, items: state.items, total: state.total }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export default useCartStore;
