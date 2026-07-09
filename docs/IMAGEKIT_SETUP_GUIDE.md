# ImageKit.io Setup Guide (Express Server - Free Alternative)

This guide will help you configure ImageKit.io for secure image storage with your photography studio management app using a free Express server instead of Firebase Cloud Functions.

## Step 1: Configure Environment Variables

### 1.1 Add to main project `.env` file

```env
VITE_IMAGEKIT_URL_ENDPOINT=https://imagekit.io
VITE_IMAGEKIT_PUBLIC_KEY=public_syL9K8pibxL6zZLyFnzRu+UuuC0=
VITE_IMAGEKIT_PRIVATE_KEY=private_U4Ivp388hDU1TabcpKpMxu8+59U=
VITE_SERVER_URL=http://localhost:3001
```

### 1.2 Add to server `.env` file (in `server/` directory)

```env
IMAGEKIT_URL_ENDPOINT=https://imagekit.io
IMAGEKIT_PUBLIC_KEY=public_syL9K8pibxL6zZLyFnzRu+UuuC0=
IMAGEKIT_PRIVATE_KEY=private_U4Ivp388hDU1TabcpKpMxu8+59U=
PORT=3001
```

## Step 2: Configure ImageKit Dashboard Settings

### 2.1 Enable Private Images

1. Log in to your ImageKit dashboard at https://imagekit.io/dashboard
2. Go to **Settings** > **Security**
3. Enable **Private Images** by default
4. This ensures all uploaded images are private and require signed URLs

### 2.2 Configure HTTP Referrer Restrictions

1. In the ImageKit dashboard, go to **Settings** > **Security**
2. Find **HTTP Referrer Restrictions**
3. Add your domain(s) to the allowed list:
   - Your production domain (e.g., `yourdomain.com`)
   - Your development domain (e.g., `localhost:3003`)
4. Set the policy to **"Allow only these domains"**
5. This prevents hotlinking and ensures images only load from your website

### 2.3 Configure Signed URL Settings

1. Go to **Settings** > **URL Generation**
2. Ensure **Signed URLs** are enabled
3. Set default expiry time to **30 minutes** (1800 seconds)
4. This is already configured in our Express server

## Step 3: Start the Servers

### 3.1 Start Express Server (for ImageKit operations)

Open a terminal and run:

```bash
npm run dev:server
```

The server will start on `http://localhost:3001`

### 3.2 Start Vite Development Server

Open another terminal and run:

```bash
npm run dev
```

The app will start on `http://localhost:3003`

### 3.3 Start Both Servers Simultaneously

You can also run both servers with one command:

```bash
npm run dev:all
```

## Step 4: Configure Firestore Security Rules

Update your `firestore.rules` to ensure proper access control:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Galleries collection
    match /galleries/{galleryId} {
      // Allow read access to authenticated users
      allow read: if request.auth != null;
      
      // Allow write access to authenticated users
      allow write: if request.auth != null;
    }
    
    // Other collections...
  }
}
```

## Step 5: Test the Integration

### 5.1 Create a Test Gallery

1. Navigate to `/admin/unified-gallery-management`
2. Click "معرض جديد" (New Gallery)
3. Fill in the details:
   - Title: Test Gallery
   - Client Name: Test Client
   - Event Date: Today's date
   - Enable password protection: Yes
   - Password: test123
4. Click create

### 5.2 Upload Test Images

1. In the gallery management page, click on the gallery
2. Click "Upload Images"
3. Drag and drop a few test images
4. Verify they upload successfully

### 5.3 Test Client Gallery Access

1. Navigate to `/gallery/{galleryId}` (replace with actual gallery ID)
2. You should see a password prompt
3. Enter the password: test123
4. Verify the gallery opens and images load
5. Try to copy an image URL and open it in a new tab - it should fail (Access Denied)

### 5.4 Test Signed URL Expiry

1. Wait 30 minutes after opening the gallery
2. Click the refresh button (unlock icon) in the gallery header
3. Verify images reload with new signed URLs

## Step 6: Deploy to Production

### 6.1 Deploy Express Server to Production

For production, you can deploy the Express server to:
- **Render** (free tier available)
- **Railway** (free tier available)
- **Heroku** (requires credit card)
- **Vercel** (serverless functions)
- **Your own VPS** (DigitalOcean, Linode, etc.)

Example for Render:
1. Push your code to GitHub
2. Create a new web service on Render
3. Connect your GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `node server/index.js`
6. Add environment variables from `server/.env`
7. Deploy

### 6.2 Update Client Environment Variables

After deploying the Express server, update your `.env` file:

```env
VITE_SERVER_URL=https://your-server-url.com
```

### 6.3 Build and Deploy the Frontend

```bash
npm run build
firebase deploy
```

## Security Features Implemented

✅ **Private Images**: All images are uploaded as private by default
✅ **Signed URLs**: Images use time-limited signed URLs (30-minute expiry)
✅ **HTTP Referrer Restrictions**: Images only load from authorized domains
✅ **Password Protection**: Galleries can be password-protected
✅ **Secure Upload**: Uploads go through Express server (private key never exposed)
✅ **Automatic URL Refresh**: Users can refresh signed URLs when they expire
✅ **No Firebase Blaze Plan Required**: Uses free Express server instead

## Important Notes

1. **Never expose the private key** - It's only used in the Express server
2. **Keep your Firebase project secure** - Use proper authentication
3. **Monitor ImageKit usage** - Check your dashboard for bandwidth and storage
4. **Update referrer restrictions** when deploying to production
5. **Test thoroughly** before deploying to production
6. **Keep Express server running** - The app won't work without it

## Troubleshooting

### Images not loading
- Check browser console for errors
- Verify Express server is running on port 3001
- Check ImageKit dashboard for upload errors
- Ensure signed URLs are being generated correctly
- Verify `VITE_SERVER_URL` is correct in `.env`

### Uploads failing
- Check Express server logs
- Verify ImageKit credentials are correct
- Check image size (should be under 10MB)
- Ensure Express server is running

### Express server not starting
- Check if port 3001 is already in use
- Verify Node.js is installed
- Check server dependencies: `cd server && npm install`
- Check server `.env` file exists

### Password not working
- Verify password hash is being stored correctly
- Check password comparison logic in ClientGallery component
- Ensure gallery has password protection enabled

## Cost Comparison

### Firebase Cloud Functions (Blaze Plan)
- Requires upgrade to Blaze plan
- Pay-as-you-go pricing
- ~$0.0000002 per invocation
- ~$0.000004 per GB-second
- Can get expensive with high usage

### Express Server (Free)
- Completely free
- Runs on your local machine or free hosting
- No per-invocation costs
- Only pay for hosting (if using paid hosting)
- Much more cost-effective for this use case

## Next Steps

After successful testing:
1. Deploy Express server to free hosting (Render/Railway)
2. Add your production domain to ImageKit referrer restrictions
3. Remove localhost from referrer restrictions
4. Update `VITE_SERVER_URL` to production URL
5. Deploy frontend to Firebase Hosting
6. Monitor ImageKit usage and costs
