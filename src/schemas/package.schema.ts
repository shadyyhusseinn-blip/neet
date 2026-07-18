/**
 * Package Validation Schema
 * Shared Zod schema for package validation
 */

import { z } from 'zod';

export const packageCategorySchema = z.enum([
  'wedding',
  'engagement',
  'birthday',
  'corporate',
  'portrait',
  'event',
]);

export const packageSchema = z.object({
  name: z.string().min(2, 'Package name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().min(0, 'Price must be positive'),
  category: packageCategorySchema,
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const createPackageSchema = packageSchema;

export const updatePackageSchema = packageSchema.partial();

export type Package = z.infer<typeof packageSchema>;
export type CreatePackage = z.infer<typeof createPackageSchema>;
export type UpdatePackage = z.infer<typeof updatePackageSchema>;
export type PackageCategory = z.infer<typeof packageCategorySchema>;
