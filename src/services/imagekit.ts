import ImageKit from 'imagekit-javascript';

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://imagekit.io',
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export interface ImageUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
}

/**
 * Upload an image to ImageKit using Express server
 * This is more secure as it uses the private key on the server
 * @param base64Image - Base64 encoded image data
 * @param fileName - The filename for the image
 * @param folder - The folder path in ImageKit (e.g., 'galleries/client-name')
 * @returns Promise with upload result
 */
export const uploadImage = async (
  base64Image: string,
  fileName: string,
  folder: string
): Promise<ImageUploadResult> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/imagekit/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        fileName,
        folder,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return {
      fileId: data.fileId,
      name: data.name,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || data.url,
      height: data.height || 0,
      width: data.width || 0,
      size: data.size || 0,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Convert File to Base64
 * @param file - The file to convert
 * @returns Promise with base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Generate a signed URL for a private image using Express server
 * @param imagePath - The ImageKit image path
 * @returns Promise with signed URL string
 */
export const generateSignedUrl = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/imagekit/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePath }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate signed URL');
    }

    const data = await response.json();
    return data.signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Delete an image from ImageKit using Express server
 * @param fileId - The ImageKit file ID
 * @returns Promise with deletion result
 */
export const deleteImage = async (fileId: string): Promise<any> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/imagekit/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Generate a transformation URL for an image
 * @param path - The image path
 * @param transformations - Array of transformations
 * @returns Transformed URL
 */
export const getTransformedUrl = (
  path: string,
  transformations: Array<{ [key: string]: string | number | boolean }>
): string => {
  return imagekit.url({
    path: path,
    transformation: transformations,
  });
};

export default imagekit;
