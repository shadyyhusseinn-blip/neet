const https = require('https');

const WEBHOOK_URL = 'https://hook.eu1.make.com/6q86bg4bxegqbt4fv7t9hxykdommckuv';

// Test 1: Admin Notification
const adminPayload = {
  timestamp: new Date().toISOString(),
  source: 'shady-hussein-website',
  type: 'admin_notification',
  data: {
    clientName: 'Ahmed Mohamed (Test)',
    phone: '201234567890',
    eventDate: '2024-12-25',
    packageName: 'Premium Package',
    eventType: 'Wedding',
    location: 'Cairo',
    notes: 'This is a test notification'
  }
};

// Test 2: Customer Notification
const customerPayload = {
  timestamp: new Date().toISOString(),
  source: 'shady-hussein-website',
  type: 'customer_notification',
  data: {
    recipient_phone: '201234567890',
    customer_name: 'Ahmed Mohamed (Test)',
    gallery_link: 'https://photography-shady-program.web.app/gallery/test-123',
    gallery_password: '1234'
  }
};

function sendWebhook(payload, testName) {
  const data = JSON.stringify(payload);
  
  const options = {
    hostname: 'hook.eu1.make.com',
    path: '/6q86bg4bxegqbt4fv7t9hxykdommckuv',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`\n=== ${testName} ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`Response: ${responseData}`);
      console.log('✅ Test completed successfully');
    });
  });

  req.on('error', (error) => {
    console.error(`\n=== ${testName} ===`);
    console.error(`❌ Error: ${error.message}`);
  });

  req.write(data);
  req.end();
}

console.log('Starting webhook tests...\n');

// Send both tests
sendWebhook(adminPayload, 'Admin Notification Test');
setTimeout(() => {
  sendWebhook(customerPayload, 'Customer Notification Test');
}, 2000); // Wait 2 seconds between tests
