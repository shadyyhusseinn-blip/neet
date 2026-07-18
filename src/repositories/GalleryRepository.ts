/**
 * Gallery Repository
 * Handles all gallery-related database operations
 */

import { BaseRepository } from './BaseRepository';
import { where, orderBy } from 'firebase/firestore';

export interface Gallery {
  id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  orderIndex: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export class GalleryRepository extends BaseRepository<Gallery> {
  constructor() {
    super({ collectionName: 'galleries' });
  }

  /**
   * Find published galleries
   */
  async findPublished(): Promise<Gallery[]> {
    return this.findWhere([
      where('isPublished', '==', true),
      orderBy('orderIndex', 'asc'),
    ]);
  }

  /**
   * Find unpublished galleries
   */
  async findUnpublished(): Promise<Gallery[]> {
    return this.findWhere([
      where('isPublished', '==', false),
      orderBy('orderIndex', 'asc'),
    ]);
  }

  /**
   * Toggle publish status
   */
  async togglePublish(id: string, isPublished: boolean): Promise<void> {
    return this.update(id, { isPublished });
  }

  /**
   * Reorder galleries
   */
  async reorder(galleryIds: string[]): Promise<void> {
    try {
      const updates = galleryIds.map((id, index) => 
        this.update(id, { orderIndex: index })
      );
      await Promise.all(updates);
      console.log('Reordered galleries', { count: galleryIds.length });
    } catch (error) {
      console.error('Error reordering galleries', { galleryIds, error });
      throw error;
    }
  }
}

// Export singleton instance
export const galleryRepository = new GalleryRepository();
