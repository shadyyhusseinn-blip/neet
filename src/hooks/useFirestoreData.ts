import { useState, useEffect } from 'react';
import { Booking, Package, Expense, Revenue, Customer, Gallery } from '../types';
import { firestoreData } from '../services/firestoreData';
import { firebaseService } from '../services/firebase';
import { storage } from '../services/storage';
import { useAuthStore } from '../stores/authStore';

// Custom Hook for Real-time Firestore Data
// This hook provides real-time data synchronization using onSnapshot
// It automatically updates when data changes in Firestore

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = firestoreData.subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  return { bookings, loading };
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = firestoreData.subscribeToPackages((updatedPackages) => {
      setPackages(updatedPackages);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  return { packages, loading };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = firestoreData.subscribeToExpenses((updatedExpenses) => {
      setExpenses(updatedExpenses);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  return { expenses, loading };
}

export function useRevenues() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = firestoreData.subscribeToRevenues((updatedRevenues) => {
      setRevenues(updatedRevenues);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  return { revenues, loading };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = firestoreData.subscribeToCustomers((updatedCustomers) => {
      setCustomers(updatedCustomers);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  return { customers, loading };
}

export function useGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = firestoreData.subscribeToGalleries((updatedGalleries) => {
      setGalleries(updatedGalleries);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  return { galleries, loading };
}

// Combined hook for all data
export function useAllData() {
  const bookings = useBookings();
  const packages = usePackages();
  const expenses = useExpenses();
  const revenues = useRevenues();
  const customers = useCustomers();
  const galleries = useGalleries();

  const loading = bookings.loading || packages.loading || expenses.loading || revenues.loading || customers.loading || galleries.loading;

  return {
    bookings: bookings.bookings,
    packages: packages.packages,
    expenses: expenses.expenses,
    revenues: revenues.revenues,
    customers: customers.customers,
    galleries: galleries.galleries,
    loading
  };
}
