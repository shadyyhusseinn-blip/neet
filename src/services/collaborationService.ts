import { getFirestore, doc, getDoc, updateDoc, arrayUnion, collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { PhotoComment } from '../types';

export interface PhotoSelection {
  photoId: string;
  selectedBy: string;
  selectedAt: string;
}

export interface PhotoApproval {
  photoId: string;
  approvedBy: string;
  approvedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface CollaborationEvent {
  type: 'selection' | 'comment' | 'approval' | 'favorite';
  photoId: string;
  userId: string;
  userName: string;
  timestamp: string;
  data?: any;
}

export class CollaborationService {
  private static listeners: Map<string, () => void> = new Map();

  // Add comment to photo
  static async addComment(
    galleryId: string,
    photoId: string,
    clientName: string,
    comment: string
  ): Promise<void> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        throw new Error('Gallery not found');
      }

      const _galleryData = galleryDoc.data();

      const newComment: PhotoComment = {
        id: `comment-${Date.now()}`,
        photoId,
        clientName,
        comment,
        createdAt: new Date().toISOString(),
      };

      await updateDoc(galleryRef, {
        comments: arrayUnion(newComment),
        updatedAt: new Date().toISOString(),
      });

      // Log collaboration event
      await this.logEvent(galleryId, {
        type: 'comment',
        photoId,
        userId: clientName,
        userName: clientName,
        timestamp: new Date().toISOString(),
        data: { comment },
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Delete comment
  static async deleteComment(galleryId: string, commentId: string): Promise<void> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        throw new Error('Gallery not found');
      }

      const galleryData = galleryDoc.data();
      const comments = galleryData.comments || [];
      const updatedComments = comments.filter((c: PhotoComment) => c.id !== commentId);

      await updateDoc(galleryRef, {
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Toggle photo favorite
  static async toggleFavorite(
    galleryId: string,
    photoId: string,
    clientName: string
  ): Promise<void> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        throw new Error('Gallery not found');
      }

      const galleryData = galleryDoc.data();
      const favorites = galleryData.favorites || [];

      let updatedFavorites: string[];
      let isAdding = false;

      if (favorites.includes(photoId)) {
        updatedFavorites = favorites.filter((id: string) => id !== photoId);
      } else {
        updatedFavorites = [...favorites, photoId];
        isAdding = true;
      }

      await updateDoc(galleryRef, {
        favorites: updatedFavorites,
        updatedAt: new Date().toISOString(),
      });

      // Log collaboration event
      if (isAdding) {
        await this.logEvent(galleryId, {
          type: 'favorite',
          photoId,
          userId: clientName,
          userName: clientName,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // Approve photo for printing
  static async approvePhoto(
    galleryId: string,
    photoId: string,
    approvedBy: string,
    status: 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        throw new Error('Gallery not found');
      }

      const galleryData = galleryDoc.data();
      const approvals = galleryData.approvals || [];

      const approval: PhotoApproval = {
        photoId,
        approvedBy,
        approvedAt: new Date().toISOString(),
        status,
        notes,
      };

      // Remove existing approval for this photo if any
      const updatedApprovals = approvals.filter((a: PhotoApproval) => a.photoId !== photoId);
      updatedApprovals.push(approval);

      await updateDoc(galleryRef, {
        approvals: updatedApprovals,
        updatedAt: new Date().toISOString(),
      });

      // Log collaboration event
      await this.logEvent(galleryId, {
        type: 'approval',
        photoId,
        userId: approvedBy,
        userName: approvedBy,
        timestamp: new Date().toISOString(),
        data: { status, notes },
      });
    } catch (error) {
      console.error('Error approving photo:', error);
      throw error;
    }
  }

  // Select photo
  static async selectPhoto(
    galleryId: string,
    photoId: string,
    selectedBy: string
  ): Promise<void> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        throw new Error('Gallery not found');
      }

      const galleryData = galleryDoc.data();
      const selections = galleryData.selections || [];

      const selection: PhotoSelection = {
        photoId,
        selectedBy,
        selectedAt: new Date().toISOString(),
      };

      // Remove existing selection for this photo if any
      const updatedSelections = selections.filter((s: PhotoSelection) => s.photoId !== photoId);
      updatedSelections.push(selection);

      await updateDoc(galleryRef, {
        selections: updatedSelections,
        updatedAt: new Date().toISOString(),
      });

      // Log collaboration event
      await this.logEvent(galleryId, {
        type: 'selection',
        photoId,
        userId: selectedBy,
        userName: selectedBy,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw error;
    }
  }

  // Log collaboration event
  private static async logEvent(galleryId: string, event: CollaborationEvent): Promise<void> {
    try {
      const db = getFirestore();
      const eventsRef = collection(db, 'client-galleries', galleryId, 'collaboration-events');
      await addDoc(eventsRef, event);
    } catch (error) {
      console.error('Error logging collaboration event:', error);
    }
  }

  // Subscribe to real-time collaboration events
  static subscribeToEvents(
    galleryId: string,
    callback: (events: CollaborationEvent[]) => void
  ): () => void {
    try {
      const db = getFirestore();
      const eventsRef = collection(db, 'client-galleries', galleryId, 'collaboration-events');
      const q = query(eventsRef, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => doc.data() as CollaborationEvent);
        callback(events);
      });

      // Store unsubscribe function
      this.listeners.set(galleryId, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to events:', error);
      return () => {};
    }
  }

  // Unsubscribe from events
  static unsubscribeFromEvents(galleryId: string): void {
    const unsubscribe = this.listeners.get(galleryId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(galleryId);
    }
  }

  // Get photo comments
  static async getPhotoComments(galleryId: string, photoId: string): Promise<PhotoComment[]> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        return [];
      }

      const galleryData = galleryDoc.data();
      const comments = galleryData.comments || [];

      return comments.filter((c: PhotoComment) => c.photoId === photoId);
    } catch (error) {
      console.error('Error getting photo comments:', error);
      return [];
    }
  }

  // Get gallery favorites
  static async getGalleryFavorites(galleryId: string): Promise<string[]> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        return [];
      }

      const galleryData = galleryDoc.data();
      return galleryData.favorites || [];
    } catch (error) {
      console.error('Error getting gallery favorites:', error);
      return [];
    }
  }

  // Get photo approvals
  static async getPhotoApprovals(galleryId: string): Promise<PhotoApproval[]> {
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        return [];
      }

      const galleryData = galleryDoc.data();
      return galleryData.approvals || [];
    } catch (error) {
      console.error('Error getting photo approvals:', error);
      return [];
    }
  }
}

export const collaborationService = CollaborationService;
