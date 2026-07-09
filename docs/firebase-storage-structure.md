# Firebase Storage Structure for Client Portal

## Storage Hierarchy

```
clients/
├── {clientId}/
│   ├── profile/
│   │   ├── cover.jpg
│   │   ├── avatar.jpg
│   ├── events/
│   │   ├── {eventId}/
│   │   │   ├── hall/
│   │   │   │   ├── raw/           # Original quality
│   │   │   │   ├── preview/       # Medium quality (1200px)
│   │   │   │   ├── thumbnail/     # Small quality (300px)
│   │   │   ├── session/
│   │   │   │   ├── raw/
│   │   │   │   ├── preview/
│   │   │   │   ├── thumbnail/
│   │   │   ├── outdoor/
│   │   │   │   ├── raw/
│   │   │   │   ├── preview/
│   │   │   │   ├── thumbnail/
│   │   │   ├── favorites/         # Client's favorite photos
│   │   │   ├── selected/          # Photos selected for printing
│   │   │   ├── downloads/         # Download history
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can access
    match /clients/{clientId}/{allPaths=**} {
      allow read: if request.auth != null && 
                     (request.auth.uid == clientId || 
                      isPhotographer(request.auth));
      allow write: if request.auth != null && isPhotographer(request.auth);
    }
  }
}

function isPhotographer(auth) {
  return exists(/databases/(default)/documents/users/(auth.uid)) &&
         get(/databases/(default)/documents/users/(auth.uid)).data.role == 'admin';
}
```

## Image Quality Standards

### Raw (Original)
- Full resolution
- No compression
- Original file format (RAW, JPG, PNG)

### Preview (Medium)
- Max width: 1200px
- Quality: 85%
- Format: JPG
- Optimized for web viewing

### Thumbnail (Small)
- Max width: 300px
- Quality: 70%
- Format: JPG
- Optimized for quick loading
