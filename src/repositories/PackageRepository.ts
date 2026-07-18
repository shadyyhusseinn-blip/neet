/**
 * Package Repository
 * Handles all package-related database operations
 */

import { BaseRepository } from './BaseRepository';
import { where, orderBy } from 'firebase/firestore';

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  features?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class PackageRepository extends BaseRepository<Package> {
  constructor() {
    super({ collectionName: 'packages' });
  }

  /**
   * Find packages by category
   */
  async findByCategory(category: string): Promise<Package[]> {
    return this.findWhere([
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('price', 'asc'),
    ]);
  }

  /**
   * Find active packages
   */
  async findActive(): Promise<Package[]> {
    return this.findWhere([
      where('isActive', '==', true),
      orderBy('category', 'asc'),
    ]);
  }

  /**
   * Find inactive packages
   */
  async findInactive(): Promise<Package[]> {
    return this.findWhere([
      where('isActive', '==', false),
      orderBy('category', 'asc'),
    ]);
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<void> {
    return this.update(id, { isActive });
  }
}

// Export singleton instance
export const packageRepository = new PackageRepository();
