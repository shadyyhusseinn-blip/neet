const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ImageKit = require('@imagekit/nodejs');
const { v2: cloudinary } = require('cloudinary');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize ImageKit
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://imagekit.io',
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dziafpxl8',
  api_key: process.env.CLOUDINARY_API_KEY || '969418968315911',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'J7O5IBBKXEtYCUTN-RDsa7TzBcc',
  secure: true,
});

/**
 * Cloud Function to generate ImageKit authentication parameters
 * This is called from the client to get secure upload parameters
 */
exports.getImageKitAuth = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to upload images'
    );
  }

  try {
    // Generate authentication parameters for ImageKit
    const authenticationParameters = imagekit.getAuthenticationParameters();

    return {
      token: authenticationParameters.token,
      expire: authenticationParameters.expire,
      signature: authenticationParameters.signature,
    };
  } catch (error) {
    console.error('Error generating ImageKit auth:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate authentication parameters'
    );
  }
});

/**
 * Cloud Function to generate signed URL for private images
 * URL expires after 30 minutes (1800 seconds)
 */
exports.getSignedImageUrl = functions.https.onCall(async (data, context) => {
  const { imagePath } = data;

  if (!imagePath) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image path is required'
    );
  }

  try {
    // Generate signed URL with 30-minute expiry
    const signedUrl = imagekit.url({
      path: imagePath,
      signed: true,
      expireSeconds: 1800, // 30 minutes
      transformation: [
        {
          width: 1200,
          quality: 80,
        },
      ],
    });

    return { signedUrl };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate signed URL'
    );
  }
});

/**
 * Cloud Function to upload image to ImageKit (server-side)
 * This is more secure as it uses the private key directly
 */
exports.uploadImageToImageKit = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to upload images'
    );
  }

  const { base64Image, fileName, folder } = data;

  if (!base64Image || !fileName || !folder) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'base64Image, fileName, and folder are required'
    );
  }

  try {
    const uploadResult = await imagekit.upload({
      file: base64Image,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      isPrivateFile: true, // Make images private by default
      tags: ['gallery', 'client'],
    });

    return {
      fileId: uploadResult.fileId,
      url: uploadResult.url,
      name: uploadResult.name,
      thumbnailUrl: uploadResult.thumbnailUrl,
      height: uploadResult.height,
      width: uploadResult.width,
      size: uploadResult.size,
    };
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to upload image'
    );
  }
});

/**
 * Cloud Function to delete image from ImageKit
 */
exports.deleteImageFromImageKit = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to delete images'
    );
  }

  const { fileId } = data;

  if (!fileId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'fileId is required'
    );
  }

  try {
    await imagekit.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from ImageKit:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete image'
    );
  }
});

/**
 * HTTP endpoint for ImageKit authentication
 * Used by client-side SDK for direct uploads
 * Note: This endpoint is public but should be rate-limited in production
 */
exports.imagekitAuth = functions.https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    console.error('Error generating auth parameters:', error);
    res.status(500).json({ error: 'Failed to generate auth parameters' });
  }
});

/**
 * Cloud Function to upload image to Cloudinary (server-side)
 * This is more secure as it uses the API secret directly
 */
exports.uploadImageToCloudinary = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to upload images'
    );
  }

  const { base64Image, fileName, folder, watermark } = data;

  if (!base64Image || !fileName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'base64Image and fileName are required'
    );
  }

  try {
    const uploadOptions = {
      folder: folder || 'galleries',
    };

    // Add watermark if specified
    if (watermark) {
      const watermarkText = watermark.text || '©';
      const watermarkColor = watermark.color || 'white';
      const watermarkOpacity = watermark.opacity || 50;

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

    const uploadResult = await cloudinary.uploader.upload(base64Image, uploadOptions);

    return {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to upload image to Cloudinary'
    );
  }
});

/**
 * Cloud Function to delete image from Cloudinary
 */
exports.deleteImageFromCloudinary = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to delete images'
    );
  }

  const { publicId } = data;

  if (!publicId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'publicId is required'
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete image from Cloudinary'
    );
  }
});
