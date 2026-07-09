# Firestore Database Schema for Client Portal

## Collections Structure

### clients/{clientId}
```javascript
{
  name: "اسم العميل",
  email: "client@example.com",
  phone: "01012345678",
  password: "hashed_password",
  createdAt: timestamp,
  updatedAt: timestamp,
  status: "active|inactive|archived",
  events: [eventId1, eventId2],
  settings: {
    allowDownload: true,
    watermark: true,
    maxDownloads: 50,
    expiryDate: timestamp
  }
}
```

### events/{eventId}
```javascript
{
  clientId: "clientId",
  title: "فرح أحمد ومحمد",
  date: timestamp,
  type: "wedding|engagement|birthday|corporate",
  status: "draft|published|archived",
  folders: ["hall", "session", "outdoor"],
  coverImage: "storage_path",
  description: "وصف الحدث",
  location: "اسم المكان",
  settings: {
    allowDownload: true,
    watermark: true,
    publicGallery: false
  },
  stats: {
    totalPhotos: 150,
    totalViews: 500,
    totalDownloads: 25
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### photos/{photoId}
```javascript
{
  eventId: "eventId",
  folder: "hall|session|outdoor",
  fileName: "IMG_0001.jpg",
  urls: {
    raw: "clients/{clientId}/events/{eventId}/hall/raw/IMG_0001.jpg",
    preview: "clients/{clientId}/events/{eventId}/hall/preview/IMG_0001.jpg",
    thumbnail: "clients/{clientId}/events/{eventId}/hall/thumbnail/IMG_0001.jpg"
  },
  metadata: {
    camera: "Canon EOS R5",
    lens: "24-70mm f/2.8",
    iso: 400,
    aperture: "f/2.8",
    shutter: "1/200",
    width: 6000,
    height: 4000,
    size: 15000000 // bytes
  },
  clientActions: {
    favorited: false,
    selected: false,
    downloaded: false,
    downloadedAt: null
  },
  photographerTags: ["best", "portrait", "group"],
  createdAt: timestamp
}
```

### downloads/{downloadId}
```javascript
{
  clientId: "clientId",
  eventId: "eventId",
  photoId: "photoId",
  fileName: "IMG_0001.jpg",
  quality: "raw|preview",
  downloadedAt: timestamp,
  ipAddress: "192.168.1.1"
}
```

### users/{userId}
```javascript
{
  email: "photographer@example.com",
  role: "admin|staff|client",
  name: "اسم المستخدم",
  createdAt: timestamp,
  lastLogin: timestamp
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Clients collection
    match /clients/{clientId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == clientId || 
                      isPhotographer(request.auth));
      allow write: if request.auth != null && isPhotographer(request.auth);
      
      match /events/{eventId} {
        allow read: if request.auth != null && 
                       (isOwner(clientId) || isPhotographer(request.auth));
        allow write: if request.auth != null && isPhotographer(request.auth);
        
        match /photos/{photoId} {
          allow read: if request.auth != null && 
                         (isOwner(clientId) || isPhotographer(request.auth));
          allow write: if request.auth != null && isPhotographer(request.auth);
        }
      }
    }
    
    // Downloads collection
    match /downloads/{downloadId} {
      allow create: if request.auth != null && isOwner(request.resource.data.clientId);
      allow read: if request.auth != null && isPhotographer(request.auth);
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

function isPhotographer(auth) {
  return exists(/databases/(default)/documents/users/(auth.uid)) &&
         get(/databases/(default)/documents/users/(auth.uid)).data.role == 'admin';
}

function isOwner(clientId) {
  return request.auth.uid == clientId;
}
```

## Indexes

```javascript
// Composite indexes
clients:
  - status (ascending)
  - createdAt (descending)

events:
  - clientId (ascending), date (descending)
  - clientId (ascending), status (ascending)
  - status (ascending), date (descending)

photos:
  - eventId (ascending), folder (ascending)
  - eventId (ascending), createdAt (descending)

downloads:
  - clientId (ascending), downloadedAt (descending)
  - eventId (ascending), downloadedAt (descending)
```
