import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseService } from './firebase';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  status: 'active' | 'inactive' | 'archived';
  events: string[];
  settings: {
    allowDownload: boolean;
    watermark: boolean;
    maxDownloads: number;
    expiryDate?: Date;
  };
}

export async function clientLogin(email: string, password: string) {
  try {
    const auth = firebaseService.getAuth();
    const db = firebaseService.getDB();
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'clients', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Client profile not found');
    }

    const clientData = userDoc.data() as Client;
    
    // Check if client is active
    if (clientData.status !== 'active') {
      throw new Error('Client account is not active');
    }

    // Check if account expired
    if (clientData.settings.expiryDate && new Date() > clientData.settings.expiryDate) {
      throw new Error('Client account has expired');
    }

    return { user: userCredential.user, client: clientData };
  } catch (error) {
    console.error('Client login error:', error);
    throw error;
  }
}

export async function createClientAccount(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  photographerId: string;
}) {
  try {
    const auth = firebaseService.getAuth();
    const db = firebaseService.getDB();
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const clientData: Client = {
      id: userCredential.user.uid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date(),
      status: 'active',
      events: [],
      settings: {
        allowDownload: true,
        watermark: true,
        maxDownloads: 50,
      }
    };

    await setDoc(doc(db, 'clients', userCredential.user.uid), clientData);
    await updateProfile(userCredential.user, { displayName: data.name });

    return { user: userCredential.user, client: clientData };
  } catch (error) {
    console.error('Create client account error:', error);
    throw error;
  }
}

export async function getClientData(clientId: string): Promise<Client> {
  try {
    const db = firebaseService.getDB();
    const clientDoc = await getDoc(doc(db, 'clients', clientId));
    if (!clientDoc.exists()) {
      throw new Error('Client not found');
    }
    return { id: clientDoc.id, ...clientDoc.data() } as Client;
  } catch (error) {
    console.error('Get client data error:', error);
    throw error;
  }
}

export async function updateClientSettings(
  clientId: string,
  settings: Partial<Client['settings']>
) {
  try {
    const db = firebaseService.getDB();
    await updateDoc(doc(db, 'clients', clientId), {
      'settings': settings,
      'updatedAt': new Date()
    });
  } catch (error) {
    console.error('Update client settings error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const auth = firebaseService.getAuth();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
