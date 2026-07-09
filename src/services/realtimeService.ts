import { firebaseService } from './firebase';

class RealtimeService {
  private subscriptions: Map<string, () => void> = new Map();

  subscribeToCollection(
    collectionName: string,
    callback: (data: any[]) => void,
    filter?: (doc: any) => boolean
  ): () => void {
    try {
      const db = firebaseService.getDB();
      const collectionRef = db.collection(collectionName);
      
      const unsubscribe = collectionRef.onSnapshot((snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        const filteredData = filter ? data.filter(filter) : data;
        callback(filteredData);
      });

      const subscriptionKey = `${collectionName}_${Date.now()}`;
      this.subscriptions.set(subscriptionKey, unsubscribe);

      return () => {
        unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      };
    } catch (error) {
      console.error('Error subscribing to collection:', error);
      return () => {};
    }
  }

  subscribeToDocument(
    collectionName: string,
    documentId: string,
    callback: (data: any) => void
  ): () => void {
    try {
      const db = firebaseService.getDB();
      const docRef = db.collection(collectionName).doc(documentId);
      
      const unsubscribe = docRef.onSnapshot((doc: any) => {
        if (doc.exists) {
          callback({
            id: doc.id,
            ...doc.data(),
          });
        } else {
          callback(null);
        }
      });

      const subscriptionKey = `${collectionName}_${documentId}_${Date.now()}`;
      this.subscriptions.set(subscriptionKey, unsubscribe);

      return () => {
        unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      };
    } catch (error) {
      console.error('Error subscribing to document:', error);
      return () => {};
    }
  }

  subscribeToQuery(
    collectionName: string,
    queryFn: (collectionRef: any) => any,
    callback: (data: any[]) => void
  ): () => void {
    try {
      const db = firebaseService.getDB();
      const collectionRef = db.collection(collectionName);
      const query = queryFn(collectionRef);
      
      const unsubscribe = query.onSnapshot((snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(data);
      });

      const subscriptionKey = `query_${collectionName}_${Date.now()}`;
      this.subscriptions.set(subscriptionKey, unsubscribe);

      return () => {
        unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      };
    } catch (error) {
      console.error('Error subscribing to query:', error);
      return () => {};
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
  }

  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }
}

export const realtimeService = new RealtimeService();
