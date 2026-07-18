/**
 * Base Repository Interface
 * Provides common CRUD operations for all repositories
 * Abstracts database implementation details from business logic
 */

import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, onSnapshot, QueryConstraint, DocumentData } from 'firebase/firestore';
import { firebaseService } from '../services/firebase';

export interface RepositoryOptions {
  collectionName: string;
}

export class BaseRepository<T extends DocumentData> {
  protected collectionName: string;

  constructor(options: RepositoryOptions) {
    this.collectionName = options.collectionName;
  }

  protected getCollection() {
    return collection(firebaseService.getDB(), this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(firebaseService.getDB(), this.collectionName, id);
  }

  /**
   * Get a single document by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by id`, { id, error });
      throw error;
    }
  }

  /**
   * Get all documents in the collection
   */
  async findAll(): Promise<T[]> {
    try {
      const collectionRef = this.getCollection();
      const snapshot = await getDocs(collectionRef);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    } catch (error) {
      console.error(`Error finding all ${this.collectionName}`, error);
      throw error;
    }
  }

  /**
   * Find documents with query constraints
   */
  async findWhere(constraints: QueryConstraint[]): Promise<T[]> {
    try {
      const q = query(this.getCollection(), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    } catch (error) {
      console.error(`Error finding ${this.collectionName} with constraints`, { constraints, error });
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = doc(this.getCollection());
      const id = docRef.id;
      
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Created ${this.collectionName}`, { id });
      return id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}`, { data, error });
      throw error;
    }
  }

  /**
   * Create a document with a specific ID
   */
  async createWithId(id: string, data: Omit<T, 'id'>): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Created ${this.collectionName} with id`, { id });
    } catch (error) {
      console.error(`Error creating ${this.collectionName} with id`, { id, data, error });
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Updated ${this.collectionName}`, { id });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}`, { id, data, error });
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
      
      console.log(`Deleted ${this.collectionName}`, { id });
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}`, { id, error });
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for a document
   */
  subscribeToDoc(id: string, callback: (data: T | null) => void): () => void {
    const docRef = this.getDocRef(id);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to ${this.collectionName}`, { id, error });
    });
    
    return unsubscribe;
  }

  /**
   * Subscribe to real-time updates for a query
   */
  subscribeToQuery(constraints: QueryConstraint[], callback: (data: T[]) => void): () => void {
    const q = query(this.getCollection(), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to ${this.collectionName} query`, { constraints, error });
    });
    
    return unsubscribe;
  }
}
