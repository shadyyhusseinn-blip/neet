/**
 * Delivery Store
 * متجر إدارة التسليمات
 */

import { create } from 'zustand';

interface Delivery {
  id: string;
  clientName: string;
  title: string;
  password: string;
  paymentCompleted: boolean;
  photos: Array<{ url: string; title: string }>;
  createdAt: string;
  photoCount: number;
}

interface DeliveryState {
  deliveries: Delivery[];
  selectedDelivery: Delivery | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setDeliveries: (deliveries: Delivery[]) => void;
  setSelectedDelivery: (delivery: Delivery | null) => void;
  addDelivery: (delivery: Delivery) => void;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  removeDelivery: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  selectedDelivery: null,
  loading: false,
  error: null,

  setDeliveries: (deliveries) => set({ deliveries }),
  
  setSelectedDelivery: (delivery) => set({ selectedDelivery: delivery }),
  
  addDelivery: (delivery) => set((state) => ({
    deliveries: [...state.deliveries, delivery]
  })),
  
  updateDelivery: (id, updates) => set((state) => ({
    deliveries: state.deliveries.map((delivery) =>
      delivery.id === id ? { ...delivery, ...updates } : delivery
    ),
    selectedDelivery: state.selectedDelivery?.id === id
      ? { ...state.selectedDelivery, ...updates }
      : state.selectedDelivery
  })),
  
  removeDelivery: (id) => set((state) => ({
    deliveries: state.deliveries.filter((delivery) => delivery.id !== id),
    selectedDelivery: state.selectedDelivery?.id === id ? null : state.selectedDelivery
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}));
