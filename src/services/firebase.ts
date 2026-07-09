import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, onSnapshot, serverTimestamp, Firestore, WhereFilterOp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKey',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'photography-shady-program.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'photography-shady-program',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'photography-shady-program.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX'
};

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;
  private functions: Functions | null = null;
  private isInitialized = false;

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (getApps().length > 0) {
          this.app = getApp();
        } else {
          this.app = initializeApp(firebaseConfig);
        }
        
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        this.storage = getStorage(this.app);
        this.functions = getFunctions(this.app, 'us-central1');
        this.isInitialized = true;
        
        console.log('✅ Firebase initialized successfully');
        resolve();
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        reject(error);
      }
    });
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Firebase is not initialized. Call initialize() first.');
    }
  }

  getAuth(): Auth {
    this.ensureInitialized();
    return this.auth!;
  }

  getDB(): Firestore {
    this.ensureInitialized();
    return this.db!;
  }

  getStorage(): FirebaseStorage {
    this.ensureInitialized();
    return this.storage!;
  }

  getFunctions(): Functions {
    this.ensureInitialized();
    return this.functions!;
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const auth = this.getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const auth = this.getAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const auth = this.getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    const auth = this.getAuth();
    return onAuthStateChanged(auth, callback);
  }

  // Firestore helpers
  async getDocument<T = Record<string, unknown>>(collectionName: string, docId: string): Promise<T | null> {
    const db = this.getDB();
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
  }

  async setDocument<T = Record<string, unknown>>(collectionName: string, docId: string, data: T): Promise<void> {
    const db = this.getDB();
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }

  async updateDocument<T = Record<string, unknown>>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    const db = this.getDB();
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const db = this.getDB();
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }

  async getCollection<T = Record<string, unknown>>(collectionName: string): Promise<T[]> {
    const db = this.getDB();
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async queryCollection<T = Record<string, unknown>>(collectionName: string, field: string, operator: WhereFilterOp, value: unknown): Promise<T[]> {
    const db = this.getDB();
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  onCollectionSnapshot<T = Record<string, unknown>>(collectionName: string, callback: (docs: T[]) => void) {
    const db = this.getDB();
    const collectionRef = collection(db, collectionName);
    return onSnapshot(collectionRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(docs);
    });
  }

  onDocumentSnapshot<T = Record<string, unknown>>(collectionName: string, docId: string, callback: (doc: T | null) => void) {
    const db = this.getDB();
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } as T : null);
    });
  }

  // Storage helpers
  async uploadFile(path: string, file: File): Promise<string> {
    const storage = this.getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async getDownloadURL(path: string): Promise<string> {
    const storage = this.getStorage();
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  }

  async deleteFile(path: string): Promise<void> {
    const storage = this.getStorage();
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  async listFiles(path: string): Promise<{ name: string; fullPath: string }[]> {
    const storage = this.getStorage();
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items.map(item => ({
      name: item.name,
      fullPath: item.fullPath
    }));
  }
}

export const firebaseService = new FirebaseService();
