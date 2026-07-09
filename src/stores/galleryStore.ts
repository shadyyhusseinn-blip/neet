/**
 * Gallery Store
 * متجر إدارة المعارض
 */

import { create } from 'zustand';
import { Gallery } from '../types';

interface GalleryState {
  galleries: Gallery[];
  selectedGallery: Gallery | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setGalleries: (galleries: Gallery[]) => void;
  setSelectedGallery: (gallery: Gallery | null) => void;
  addGallery: (gallery: Gallery) => void;
  updateGallery: (id: string, updates: Partial<Gallery>) => void;
  removeGallery: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  galleries: [],
  selectedGallery: null,
  loading: false,
  error: null,

  setGalleries: (galleries) => set({ galleries }),
  
  setSelectedGallery: (gallery) => set({ selectedGallery: gallery }),
  
  addGallery: (gallery) => set((state) => ({
    galleries: [...state.galleries, gallery]
  })),
  
  updateGallery: (id, updates) => set((state) => ({
    galleries: state.galleries.map((gallery) =>
      gallery.id === id ? { ...gallery, ...updates } : gallery
    ),
    selectedGallery: state.selectedGallery?.id === id
      ? { ...state.selectedGallery, ...updates }
      : state.selectedGallery
  })),
  
  removeGallery: (id) => set((state) => ({
    galleries: state.galleries.filter((gallery) => gallery.id !== id),
    selectedGallery: state.selectedGallery?.id === id ? null : state.selectedGallery
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}));
