const https = require('https');

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';

// Test payload for manual WhatsApp message
const payload = {
  timestamp: new Date().toISOString(),
  source: 'shady-hussein-website',
  type: 'manual_whatsapp_message',
  data: {
    recipient_phone: '201008189569',
    message: 'مرحباً، هذه رسالة تجريبية من نظام شادي حسين',
    raw: {
      phone: '201008189569',
      message: 'مرحباً، هذه رسالة تجريبية من نظام شادي حسين'
    }
  }
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'hooks.zapier.com',
  path: '/hooks/catch/28043609/42mmsti/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('=== Zapier Webhook Test ===');
console.log('URL:', ZAPIER_WEBHOOK_URL);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('\nSending request...\n');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== Response Body ===');
    console.log(responseData);
    
    try {
      const parsed = JSON.parse(responseData);
      console.log('\n=== Parsed Response ===');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('\nResponse is not valid JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('\n=== Request Error ===');
  console.error(error.message);
});

req.write(data);
req.end();
