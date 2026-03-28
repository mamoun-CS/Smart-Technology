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
    (set, get) => ({
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
      // Also validates token with server to ensure it's still valid
      initialize: async () => {
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('accessToken');
          
          if (userStr && token) {
            try {
              const user = JSON.parse(userStr);
              // Optionally validate token with server
              set({ user, isAuthenticated: true, _hasHydrated: true });
            } catch (e) {
              // Invalid user data, clear storage
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              set({ user: null, isAuthenticated: false, _hasHydrated: true });
            }
          } else {
            set({ _hasHydrated: true });
          }
          
          // Listen for unauthorized events from API
          const handleUnauthorized = (event) => {
            console.log('Auth: unauthorized event received', event.detail);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            set({ user: null, isAuthenticated: false });
          };
          
          window.addEventListener('auth:unauthorized', handleUnauthorized);
          
          // Cleanup listener on component unmount (via store)
          return () => {
            if (typeof window !== 'undefined') {
              window.removeEventListener('auth:unauthorized', handleUnauthorized);
            }
          };
        }
        set({ _hasHydrated: true });
      },

      // Validate token with server
      validateToken: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const response = await authAPI.getCurrentUser();
          const user = response.data.user;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          // Token is invalid, clear storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
          set({ user: null, isAuthenticated: false });
          return false;
        }
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
