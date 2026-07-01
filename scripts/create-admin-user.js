/**
 * Script to create an admin user in Firebase Authentication and Firestore
 * Run with: node scripts/create-admin-user.js
 */

import admin from 'firebase-admin';
import serviceAccount from '../service-account-key.json' assert { type: 'json' };

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'photography-shady-program'
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdminUser() {
  const email = 'shadyyhusseinn@gmail.com';
  const password = 'admin123';
  const displayName = 'Shady Hussein';

  try {
    console.log('Creating admin user...');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true
    });

    console.log('✅ User created in Firebase Auth:', userRecord.uid);

    // Create user document in Firestore
    const userDoc = {
      id: userRecord.uid,
      email: email,
      name: displayName,
      role: 'admin',
      isBlocked: false,
      forceLogout: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);

    console.log('✅ User document created in Firestore');
    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
