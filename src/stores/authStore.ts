import { create } from 'zustand';
import { User } from '../types';
import { firebaseService } from '../services/firebase';
import { sendUserRegistrationToWebhook } from '../utils/makeWebhook';
import { firestoreData } from '../services/firestoreData';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  signIn: (email: string, password: string, role?: 'admin' | 'staff' | 'developer' | 'client-manager') => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ success: boolean; error?: string }>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  setUser: (user) => set({ user, isLoggedIn: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: async () => {
    await firebaseService.signOut();
    set({ user: null, isLoggedIn: false, isLoading: false });
  },
  
  signIn: async (email: string, password: string, role: 'admin' | 'staff' | 'developer' | 'client-manager' | undefined = undefined) => {
    try {
      const firebaseUser = await firebaseService.signInWithEmailAndPassword(email, password);

      if (firebaseUser) {
        // Try to get user data from Firestore
        let userData = null;
        try {
          userData = await firestoreData.getUserById(firebaseUser.uid);
        } catch (e) {
          console.log('User not found in Firestore, using default role');
        }

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || userData?.name || '',
          role: userData?.role || role || 'admin',
          isBlocked: userData?.isBlocked || false,
          forceLogout: userData?.forceLogout || false,
          createdAt: userData?.createdAt || firebaseUser.metadata.creationTime,
          lastLogin: new Date().toISOString(),
        };

        // Update last login in Firestore
        try {
          await firestoreData.saveUser(user);
        } catch (e) {
          console.log('Could not update user in Firestore');
        }

        set({ user, isLoggedIn: true, isLoading: false });
        return { success: true };
      }

      return { success: false, error: 'Failed to sign in' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  },
  
  signUp: async (email: string, password: string, metadata: any) => {
    try {
      // Firebase Auth doesn't have a direct signUp method in the same way
      // This would need to be implemented with createUserWithEmailAndPassword
      
      // Send webhook event for user registration
      await sendUserRegistrationToWebhook({ email, role: metadata?.role || 'viewer' });
      
      return { success: false, error: 'Sign up not implemented' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  },
  
  initializeAuth: async () => {
    try {
      // Listen for auth changes
      firebaseService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // Try to get user data from Firestore
          let userData = null;
          try {
            userData = await firestoreData.getUserById(firebaseUser.uid);
          } catch (e) {
            console.log('User not found in Firestore');
          }

          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || userData?.name || '',
            role: userData?.role || 'admin',
            isBlocked: userData?.isBlocked || false,
            forceLogout: userData?.forceLogout || false,
            createdAt: userData?.createdAt || firebaseUser.metadata.creationTime,
            lastLogin: new Date().toISOString(),
          };

          // Check if user is blocked or force logout
          if (user.isBlocked || user.forceLogout) {
            await firebaseService.signOut();
            set({ user: null, isLoggedIn: false, isLoading: false });
            return;
          }

          set({ user, isLoggedIn: true, isLoading: false });
        } else {
          set({ user: null, isLoggedIn: false, isLoading: false });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },
}));
