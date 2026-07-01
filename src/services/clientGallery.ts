import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseService } from './firebase';

export interface Photo {
  id: string;
  eventId: string;
  folder: string;
  fileName: string;
  urls: {
    raw: string;
    preview: string;
    thumbnail: string;
  };
  metadata: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutter?: string;
    width: number;
    height: number;
    size: number;
  };
  clientActions: {
    favorited: boolean;
    selected: boolean;
    downloaded: boolean;
    downloadedAt?: Date;
  };
  photographerTags: string[];
  createdAt: Date;
}

export async function uploadPhoto(
  clientId: string,
  eventId: string,
  folder: string,
  file: File,
  metadata?: any
): Promise<Photo> {
  try {
    const storage = firebaseService.getStorage();
    const db = firebaseService.getDB();

    const fileName = `${Date.now()}_${file.name}`;
    
    // Upload raw image
    const rawPath = `clients/${clientId}/events/${eventId}/${folder}/raw/${fileName}`;
    const rawRef = ref(storage, rawPath);
    await uploadBytes(rawRef, file);
    const rawUrl = await getDownloadURL(rawRef);

    // Create photo document
    const photoData: Photo = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      folder,
      fileName,
      urls: {
        raw: rawUrl,
        preview: rawUrl, // Will be updated after processing
        thumbnail: rawUrl, // Will be updated after processing
      },
      metadata: {
        width: 0,
        height: 0,
        size: file.size,
        ...metadata
      },
      clientActions: {
        favorited: false,
        selected: false,
        downloaded: false
      },
      photographerTags: [],
      createdAt: new Date()
    };

    await setDoc(doc(db, 'photos', photoData.id), photoData);

    // Trigger image processing (preview and thumbnail)
    // This would be done via Firebase Functions
    await triggerImageProcessing(clientId, eventId, folder, fileName, photoData.id);

    return photoData;
  } catch (error) {
    console.error('Upload photo error:', error);
    throw error;
  }
}

export async function uploadMultiplePhotos(
  clientId: string,
  eventId: string,
  folder: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Photo[]> {
  const photos: Photo[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const photo = await uploadPhoto(clientId, eventId, folder, files[i]);
    photos.push(photo);
    
    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100);
    }
  }
  
  return photos;
}

export async function getEventPhotos(eventId: string, folder?: string): Promise<Photo[]> {
  try {
    const db = firebaseService.getDB();
    let q;
    
    if (folder) {
      q = query(
        collection(db, 'photos'),
        where('eventId', '==', eventId),
        where('folder', '==', folder)
      );
    } else {
      q = query(
        collection(db, 'photos'),
        where('eventId', '==', eventId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
  } catch (error) {
    console.error('Get event photos error:', error);
    throw error;
  }
}

export async function togglePhotoFavorite(photoId: string, favorited: boolean): Promise<void> {
  try {
    const db = firebaseService.getDB();
    await updateDoc(doc(db, 'photos', photoId), {
      'clientActions.favorited': favorited
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    throw error;
  }
}

export async function togglePhotoSelection(photoId: string, selected: boolean): Promise<void> {
  try {
    const db = firebaseService.getDB();
    await updateDoc(doc(db, 'photos', photoId), {
      'clientActions.selected': selected
    });
  } catch (error) {
    console.error('Toggle selection error:', error);
    throw error;
  }
}

export async function downloadPhoto(photoId: string, quality: 'raw' | 'preview' = 'raw'): Promise<string> {
  try {
    const db = firebaseService.getDB();
    const photoDoc = await getDoc(doc(db, 'photos', photoId));
    
    if (!photoDoc.exists()) {
      throw new Error('Photo not found');
    }

    const photo = photoDoc.data() as Photo;
    const url = quality === 'raw' ? photo.urls.raw : photo.urls.preview;

    // Record download
    await setDoc(doc(db, 'downloads', `${Date.now()}_${photoId}`), {
      photoId,
      quality,
      downloadedAt: new Date()
    });

    // Update photo download status
    await updateDoc(doc(db, 'photos', photoId), {
      'clientActions.downloaded': true,
      'clientActions.downloadedAt': new Date()
    });

    return url;
  } catch (error) {
    console.error('Download photo error:', error);
    throw error;
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const db = firebaseService.getDB();
    const storage = firebaseService.getStorage();
    
    const photoDoc = await getDoc(doc(db, 'photos', photoId));
    if (!photoDoc.exists()) {
      throw new Error('Photo not found');
    }

    const photo = photoDoc.data() as Photo;

    // Delete from storage
    await deleteObject(ref(storage, photo.urls.raw));
    await deleteObject(ref(storage, photo.urls.preview));
    await deleteObject(ref(storage, photo.urls.thumbnail));

    // Delete from database
    await deleteObject(doc(db, 'photos', photoId));
  } catch (error) {
    console.error('Delete photo error:', error);
    throw error;
  }
}

async function triggerImageProcessing(
  clientId: string,
  eventId: string,
  folder: string,
  fileName: string,
  photoId: string
): Promise<void> {
  // This would trigger a Firebase Function to process the image
  // For now, we'll just log it
  console.log('Image processing triggered:', { clientId, eventId, folder, fileName, photoId });
  
  // In production, this would call a Firebase Function:
  // const processImageFunction = httpsCallable(functions, 'processImage');
  // await processImageFunction({ clientId, eventId, folder, fileName, photoId });
}

export async function getClientFavorites(clientId: string): Promise<Photo[]> {
  try {
    const db = firebaseService.getDB();
    const eventsQuery = query(
      collection(db, 'events'),
      where('clientId', '==', clientId)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    
    const eventIds = eventsSnapshot.docs.map(doc => doc.id);
    
    if (eventIds.length === 0) return [];
    
    const photosQuery = query(
      collection(db, 'photos'),
      where('eventId', 'in', eventIds),
      where('clientActions.favorited', '==', true)
    );
    const photosSnapshot = await getDocs(photosQuery);
    
    return photosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
  } catch (error) {
    console.error('Get client favorites error:', error);
    throw error;
  }
}

export async function getClientSelectedPhotos(clientId: string): Promise<Photo[]> {
  try {
    const db = firebaseService.getDB();
    const eventsQuery = query(
      collection(db, 'events'),
      where('clientId', '==', clientId)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    
    const eventIds = eventsSnapshot.docs.map(doc => doc.id);
    
    if (eventIds.length === 0) return [];
    
    const photosQuery = query(
      collection(db, 'photos'),
      where('eventId', 'in', eventIds),
      where('clientActions.selected', '==', true)
    );
    const photosSnapshot = await getDocs(photosQuery);
    
    return photosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
  } catch (error) {
    console.error('Get client selected photos error:', error);
    throw error;
  }
}
