import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '@/lib';

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

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      _hasHydrated: false,

      // Set hydration flag
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Initialize from localStorage - called manually after mount
      initialize: () => {
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('accessToken');
          if (userStr && token) {
            set({ user: JSON.parse(userStr), isAuthenticated: true });
          }
        }
        set({ _hasHydrated: true });
      },

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Registration failed' 
          });
          throw error;
        }
      },

      // Login
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(data);
          const { user, accessToken } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
          return response.data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Login failed' 
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
          set({ user: null, isAuthenticated: false });
        }
      },

      // Get current user
      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getCurrentUser();
          const user = response.data.user;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export default useAuthStore;
