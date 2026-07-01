// Save Zapier webhook URL to Firebase using existing firebaseService
// This script needs to be run in the browser console or integrated into the app

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';

console.log('=== Save Zapier Webhook URL ===');
console.log('URL:', ZAPIER_WEBHOOK_URL);
console.log('\nTo save this URL, run this in the browser console:');
console.log(`
firebaseService.setDocument('app_settings', 'config', {
  zapierWebhookUrl: '${ZAPIER_WEBHOOK_URL}'
}).then(() => {
  console.log('✅ Saved successfully!');
}).catch(err => {
  console.error('❌ Error:', err);
});
`);
