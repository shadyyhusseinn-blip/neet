const express = require('express');
const cors = require('cors');
const ImageKit = require('@imagekit/nodejs');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ImageKit server is running' });
});

// Generate authentication parameters for client-side uploads
app.get('/api/imagekit/auth', (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    console.error('Error generating auth parameters:', error);
    res.status(500).json({ error: 'Failed to generate auth parameters' });
  }
});

// Upload image to ImageKit (server-side - more secure)
app.post('/api/imagekit/upload', async (req, res) => {
  try {
    const { base64Image, fileName, folder } = req.body;

    if (!base64Image || !fileName || !folder) {
      return res.status(400).json({ error: 'base64Image, fileName, and folder are required' });
    }

    const uploadResult = await imagekit.upload({
      file: base64Image,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      isPrivateFile: true, // Make images private by default
      tags: ['gallery', 'client'],
    });

    res.json({
      fileId: uploadResult.fileId,
      url: uploadResult.url,
      name: uploadResult.name,
      thumbnailUrl: uploadResult.thumbnailUrl,
      height: uploadResult.height,
      width: uploadResult.width,
      size: uploadResult.size,
    });
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Generate signed URL for private images (30-minute expiry)
app.post('/api/imagekit/signed-url', (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ error: 'imagePath is required' });
    }

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

    res.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Delete image from ImageKit
app.post('/api/imagekit/delete', async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }

    await imagekit.deleteFile(fileId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting from ImageKit:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Upload image to Cloudinary (server-side - more secure)
app.post('/api/cloudinary/upload', async (req, res) => {
  try {
    const { base64Image, fileName, folder, watermark } = req.body;

    if (!base64Image || !fileName) {
      return res.status(400).json({ error: 'base64Image and fileName are required' });
    }

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

    res.json({
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// Delete image from Cloudinary
app.post('/api/cloudinary/delete', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ImageKit server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
