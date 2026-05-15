import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const customStorage = {
  getItem: async (name) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: async (name, value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'en',
      compactMode: false,
      showImages: true,
      
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },
      
      setLanguage: (language) => set({ language }),
      
      setCompactMode: (compactMode) => set({ compactMode }),
      
      setShowImages: (showImages) => set({ showImages }),
      
      applyTheme: (theme) => {
        if (typeof window === 'undefined') return;
        
        const root = document.documentElement;
        
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        } else if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
      
      initializeTheme: () => {
        const { theme, applyTheme } = get();
        applyTheme(theme);
        
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', (e) => {
            const root = document.documentElement;
            if (e.matches) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);
