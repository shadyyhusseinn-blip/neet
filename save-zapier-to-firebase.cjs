// Script to save Zapier webhook URL to Firebase
// This requires Firebase SDK initialization

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';

console.log('=== Save Zapier Webhook URL to Firebase ===');
console.log('URL:', ZAPIER_WEBHOOK_URL);
console.log('\nTo save this URL to Firebase:');
console.log('1. Open your application');
console.log('2. Go to Settings > Integrations (التكاملات)');
console.log('3. Paste the URL in "رابط Zapier Webhook للواتساب" field');
console.log('4. Click "حفظ الرابط"');
console.log('\nOr manually add it to Firebase:');
console.log('Collection: app_settings');
console.log('Document: config');
console.log('Field: zapierWebhookUrl');
console.log('Value:', ZAPIER_WEBHOOK_URL);
