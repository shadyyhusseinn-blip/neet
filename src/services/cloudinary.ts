/**
 * Cloudinary Service
 * خدمة Cloudinary لرفع وتخزين الصور
 */

import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloud_name: 'dziafpxl8',
  api_key: '969418968315911',
  api_secret: 'J7O5IBBKXEtYCUTN-RDsa7TzBcc',
  secure: true,
};

// Initialize Cloudinary
cloudinary.config(CLOUDINARY_CONFIG);

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  watermark?: {
    text: string;
    color?: string;
    opacity?: number;
    position?: string;
  };
  transformation?: any;
}

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // Convert File to base64 for browser upload
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const base64Data = reader.result as string;
      
      const uploadOptions: any = {
        folder: options.folder || 'galleries',
      };

      // Add watermark if specified
      if (options.watermark) {
        const watermarkText = options.watermark.text || '©';
        const watermarkColor = options.watermark.color || 'white';
        const watermarkOpacity = options.watermark.opacity || 50;
        
        uploadOptions.transformation = [
          {
            overlay: {
              font_family: 'Arial',
              font_size: 50,
              font_weight: 'bold',
              text: watermarkText,
              color: watermarkColor,
              opacity: watermarkOpacity,
            },
          },
          { angle: -45 },
          { flags: 'layer_apply' },
        ];
      }

      cloudinary.uploader.upload(
        base64Data,
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          }
        }
      );
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Get watermarked image URL
 */
export const getWatermarkedUrl = (
  publicId: string,
  watermarkText: string = '©'
): string => {
  return cloudinary.url(publicId, {
    transformation: [
      {
        overlay: {
          font_family: 'Arial',
          font_size: 50,
          font_weight: 'bold',
          text: watermarkText,
          color: 'white',
          opacity: 50,
        },
      },
      { angle: -45 },
      { flags: 'layer_apply' },
    ],
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Get optimized image URL
 */
export const getOptimizedUrl = (
  publicId: string,
  width: number = 800,
  quality: number = 80
): string => {
  return cloudinary.url(publicId, {
    transformation: [
      { width, quality, crop: 'limit' },
    ],
  });
};

export default cloudinary;
