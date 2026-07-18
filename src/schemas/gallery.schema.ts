/**
 * Gallery Validation Schema
 * Shared Zod schema for gallery validation
 */

import { z } from 'zod';

export const gallerySchema = z.object({
  title: z.string().min(2, 'Gallery title must be at least 2 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  isPublished: z.boolean().default(false),
  orderIndex: z.number().int().min(0).default(0),
  coverImage: z.string().url().optional(),
});

export const createGallerySchema = gallerySchema;

export const updateGallerySchema = gallerySchema.partial();

export type Gallery = z.infer<typeof gallerySchema>;
export type CreateGallery = z.infer<typeof createGallerySchema>;
export type UpdateGallery = z.infer<typeof updateGallerySchema>;
