import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDohLDuQCqqJchYQnNbAV_-gWIMq3IgW8o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "photography-shady-program.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "photography-shady-program",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "photography-shady-program.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1025301565267",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1025301565267:web:0a9335f5acc4855d92dba6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NVGRWW8K9V"
};

class FirebaseService {
  private app: any = null;
  private auth: any = null;
  private db: any = null;
  private storage: any = null;
  private functions: any = null;
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

  getAuth() {
    return this.auth;
  }

  getDB() {
    return this.db;
  }

  getStorage() {
    return this.storage;
  }

  getFunctions() {
    return this.functions;
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      return userCredential.user;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Firestore helpers
  async getDocument(collectionName: string, docId: string): Promise<any> {
    const docRef = doc(this.db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async setDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }

  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    await deleteDoc(docRef);
  }

  async getCollection(collectionName: string): Promise<any[]> {
    const collectionRef = collection(this.db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async queryCollection(collectionName: string, field: string, operator: any, value: any): Promise<any[]> {
    const collectionRef = collection(this.db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  onCollectionSnapshot(collectionName: string, callback: (docs: any[]) => void) {
    if (!this.db) {
      console.error('❌ Firestore DB is not initialized');
      return () => {};
    }
    const collectionRef = collection(this.db, collectionName);
    return onSnapshot(collectionRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    });
  }

  onDocumentSnapshot(collectionName: string, docId: string, callback: (doc: any) => void) {
    const docRef = doc(this.db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } : null);
    });
  }

  // Storage helpers
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async getDownloadURL(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  async listFiles(path: string): Promise<any[]> {
    const storageRef = ref(this.storage, path);
    const result = await listAll(storageRef);
    return result.items.map(item => ({
      name: item.name,
      fullPath: item.fullPath
    }));
  }
}

export const firebaseService = new FirebaseService();
