const https = require('https');

// Firebase REST API endpoint
// Replace with your actual Firebase project ID
const FIREBASE_PROJECT_ID = 'photography-shady-program';
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';

const payload = {
  zapierWebhookUrl: ZAPIER_WEBHOOK_URL
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'firestore.googleapis.com',
  path: `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/app_settings/config`,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('=== Saving Zapier Webhook URL to Firebase ===');
console.log('URL:', ZAPIER_WEBHOOK_URL);
console.log('Project:', FIREBASE_PROJECT_ID);
console.log('\nSending request...\n');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== Response ===');
    console.log(responseData);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ Zapier webhook URL saved successfully!');
    } else {
      console.log('\n❌ Failed to save. Status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('\n=== Request Error ===');
  console.error(error.message);
  console.log('\nAlternative: Save manually in the app Settings > Integrations');
});

req.write(data);
req.end();
