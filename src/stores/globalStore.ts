import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GlobalState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;

  // User Preferences
  favorites: string[];
  recentPages: string[];
  quickLinks: string[];

  // App State
  isLoading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setCurrency: (currency: string) => void;
  addFavorite: (page: string) => void;
  removeFavorite: (page: string) => void;
  addRecentPage: (page: string) => void;
  addQuickLink: (page: string) => void;
  removeQuickLink: (page: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  clearMessages: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      // Initial State
      sidebarOpen: true,
      theme: 'dark',
      language: 'ar',
      currency: 'EGP',
      favorites: [],
      recentPages: [],
      quickLinks: [],
      isLoading: false,
      error: null,
      success: null,

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      addFavorite: (page) => set((state) => ({ favorites: [...state.favorites, page] })),
      removeFavorite: (page) => set((state) => ({ favorites: state.favorites.filter((p) => p !== page) })),
      addRecentPage: (page) => set((state) => {
        const filtered = state.recentPages.filter((p) => p !== page);
        return { recentPages: [page, ...filtered].slice(0, 10) };
      }),
      addQuickLink: (page) => set((state) => ({ quickLinks: [...state.quickLinks, page] })),
      removeQuickLink: (page) => set((state) => ({ quickLinks: state.quickLinks.filter((p) => p !== page) })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
      clearMessages: () => set({ error: null, success: null }),
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        language: state.language,
        currency: state.currency,
        favorites: state.favorites,
        recentPages: state.recentPages,
        quickLinks: state.quickLinks,
      }),
    }
  )
);
