import { Review, Gallery } from '../types';
import { firestoreData } from './firestoreData';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

class ReviewService {
  async addReview(galleryId: string, review: Omit<Review, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const gallery = await firestoreData.getGalleryById(galleryId);
      if (!gallery) return false;

      const reviews = gallery.reviews || [];
      reviews.push(newReview);

      const updatedGallery = { ...gallery, reviews, viewCount: (gallery.viewCount || 0) + 1 };
      await firestoreData.saveGallery(updatedGallery);

      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  }

  async deleteReview(galleryId: string, reviewId: string): Promise<boolean> {
    try {
      const gallery = await firestoreData.getGalleryById(galleryId);
      if (!gallery) return false;

      const reviews = (gallery.reviews || []).filter(r => r.id !== reviewId);
      const updatedGallery = { ...gallery, reviews };
      await firestoreData.saveGallery(updatedGallery);

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  async getReviewStats(galleryId: string): Promise<ReviewStats | null> {
    try {
      const gallery = await firestoreData.getGalleryById(galleryId);
      if (!gallery || !gallery.reviews) return null;

      const reviews = gallery.reviews;
      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return null;
    }
  }

  async getAllReviews(): Promise<(Review & { galleryId: string; galleryTitle: string })[]> {
    try {
      const galleries = await firestoreData.getGalleries();
      const allReviews: (Review & { galleryId: string; galleryTitle: string })[] = [];

      galleries.forEach(gallery => {
        if (gallery.reviews) {
          gallery.reviews.forEach(review => {
            allReviews.push({
              ...review,
              galleryId: gallery.id,
              galleryTitle: gallery.title,
            });
          });
        }
      });

      return allReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting all reviews:', error);
      return [];
    }
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const allReviews = await this.getAllReviews();
    return allReviews.slice(0, limit);
  }

  async getTopRatedGalleries(limit: number = 5): Promise<Gallery[]> {
    try {
      const galleries = await firestoreData.getGalleries();
      const galleriesWithStats = await Promise.all(
        galleries.map(async (gallery) => {
          const stats = await this.getReviewStats(gallery.id);
          return {
            gallery,
            stats,
          };
        })
      );

      return galleriesWithStats
        .filter(item => item.stats && item.stats.totalReviews > 0)
        .sort((a, b) => (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0))
        .slice(0, limit)
        .map(item => item.gallery);
    } catch (error) {
      console.error('Error getting top rated galleries:', error);
      return [];
    }
  }

  validateReview(review: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!review.clientName || review.clientName.length < 3) {
      errors.push('اسم العميل يجب أن يكون 3 أحرف على الأقل');
    }

    if (!review.rating || review.rating < 1 || review.rating > 5) {
      errors.push('التقييم يجب أن يكون بين 1 و 5');
    }

    if (!review.comment || review.comment.length < 10) {
      errors.push('التعليق يجب أن يكون 10 أحرف على الأقل');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const reviewService = new ReviewService();
