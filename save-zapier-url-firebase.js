const admin = require('firebase-admin');

// Firebase configuration (replace with your actual config)
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';

async function saveZapierUrl() {
  try {
    console.log('=== Saving Zapier Webhook URL to Firebase ===');
    console.log('URL:', ZAPIER_WEBHOOK_URL);
    
    const docRef = db.collection('app_settings').doc('config');
    
    // Check if document exists
    const doc = await docRef.get();
    
    if (doc.exists) {
      // Update existing document
      await docRef.update({
        zapierWebhookUrl: ZAPIER_WEBHOOK_URL
      });
      console.log('✅ Updated existing document');
    } else {
      // Create new document
      await docRef.set({
        zapierWebhookUrl: ZAPIER_WEBHOOK_URL
      });
      console.log('✅ Created new document');
    }
    
    console.log('✅ Zapier webhook URL saved successfully!');
    console.log('Collection: app_settings');
    console.log('Document: config');
    console.log('Field: zapierWebhookUrl');
    
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
  }
}

saveZapierUrl().then(() => {
  process.exit(0);
});
