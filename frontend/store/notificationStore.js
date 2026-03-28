import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { notificationsAPI } from '@/lib';

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

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      _hasHydrated: false,

      // Set hydration flag
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Fetch notifications
      fetchNotifications: async () => {
        set({ isLoading: true });
        try {
          const response = await notificationsAPI.getAll({ limit: 20 });
          set({ 
            notifications: response.data.notifications, 
            unreadCount: response.data.unreadCount,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ isLoading: false });
        }
      },

      // Mark as read
      markAsRead: async (id) => {
        try {
          await notificationsAPI.markAsRead(id);
          set(state => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      },

      // Mark all as read
      markAllAsRead: async () => {
        try {
          await notificationsAPI.markAllAsRead();
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }));
        } catch (error) {
          console.error('Error marking all as read:', error);
        }
      },

      // Delete notification
      deleteNotification: async (id) => {
        try {
          await notificationsAPI.delete(id);
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting notification:', error);
        }
      }
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ notifications: state.notifications, unreadCount: state.unreadCount }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export default useNotificationStore;
