const https = require('https');

// Configuration
const PHONE_NUMBER_ID = '1140996022435992';
const META_ACCESS_TOKEN = 'EAAbcZCBzZA61MBRwKCR8q7gnHFZANqurZAk4zLI0ssBsKRbNYlADpZB1iMV2krLTrRzLZCvYhiNHwqDDApICgedSfHYGUSkhQ8IgLWYzECOMGCOMGuc7jOMWQulAXoa8gtPcLPTEUT1DFkacZAO73nyEJHFwJCA6VXQBx985ZCTl4yeFnboRLZAvRBhOO4KhMfsAw9FJ7w15lfJeRt6yZCNj2id3oQHydC77M3kZARmmgSjGu4qqZCZARvg92p5YbUZBCZCaCaQciunKToQLccYoMSo4E5P';
const RECIPIENT_PHONE = '201008189569';

// Simple test payload
const payload = {
  to: RECIPIENT_PHONE,
  text: {
    body: 'Test message from Shady Hussein Photography'
  }
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'graph.facebook.com',
  path: `/v25.0/${PHONE_NUMBER_ID}/messages?messaging_product=whatsapp`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('=== Meta WhatsApp API Test ===');
console.log('Phone Number ID:', PHONE_NUMBER_ID);
console.log('Recipient:', RECIPIENT_PHONE);
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
    console.log('\n=== Full Response Body ===');
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
