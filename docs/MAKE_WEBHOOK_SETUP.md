# Make.com Webhook Integration

This document explains how to integrate the Make.com webhook for booking notifications.

## Setup Instructions

### 1. Create a Make.com Webhook

1. Log in to your Make.com account
2. Create a new scenario
3. Add a "Webhooks" module as the first step
4. Choose "Custom webhook"
5. Click "Add" to create a new webhook
6. Copy the generated webhook URL (it will look like: `https://hook.us1.make.com/your-webhook-id`)

### 2. Configure Environment Variables

Add the webhook URL to your `.env` file:

```env
MAKE_WEBHOOK_URL=https://hook.us1.make.com/your-webhook-id
```

### 3. Install Dependencies

```bash
npm install axios
```

### 4. Usage in Your Application

#### Option 1: Direct Function Call

```typescript
import { sendToMakeWebhook } from './utils/makeWebhook';

const bookingData = {
  clientName: 'Ahmed Mohamed',
  phone: '+201234567890',
  email: 'ahmed@example.com',
  eventType: 'زفاف',
  eventDate: '2024-12-25',
  location: 'Cairo',
  notes: 'Special requirements',
  packageName: 'Premium Package',
  totalPrice: 5000
};

const result = await sendToMakeWebhook(bookingData);
console.log(result);
```

#### Option 2: Express Route

```typescript
import makeWebhookRoute from './routes/makeWebhookRoute';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/api', makeWebhookRoute);

// POST /api/make-webhook
app.listen(3000);
```

## Payload Structure

The webhook sends the following payload to Make.com:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "shady-hussein-website",
  "data": {
    "client": {
      "name": "Ahmed Mohamed",
      "phone": "+201234567890",
      "email": "ahmed@example.com"
    },
    "booking": {
      "packageName": "Premium Package",
      "totalPrice": 5000,
      "eventType": "زفاف",
      "eventDate": "2024-12-25",
      "location": "Cairo",
      "notes": "Special requirements"
    }
  }
}
```

## Error Handling

The function handles the following error scenarios:

1. **Missing Webhook URL**: Returns error if `MAKE_WEBHOOK_URL` is not set
2. **Network Errors**: Handles timeout and connection errors gracefully
3. **Server Errors**: Captures and logs HTTP error responses
4. **Validation Errors**: Validates required fields before sending

## Testing

### Test the Webhook Locally

```bash
curl -X POST http://localhost:3000/api/make-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test User",
    "phone": "+201234567890",
    "eventType": "زفاف",
    "eventDate": "2024-12-25"
  }'
```

### Test with Make.com

1. After setting up the webhook in Make.com, open the scenario
2. Click "Run once" to test
3. Make a request to your endpoint
4. Check if the webhook receives the data

## Integration with Booking Form

To integrate with your existing booking form in `LandingPage.tsx`:

```typescript
import { sendToMakeWebhook } from '../utils/makeWebhook';

const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validation ...
  
  try {
    // Send to Make.com webhook
    const webhookResult = await sendToMakeWebhook({
      clientName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      location: formData.location,
      notes: formData.notes
    });

    if (webhookResult.success) {
      console.log('Webhook sent successfully');
    } else {
      console.error('Webhook failed:', webhookResult.message);
    }

    // Navigate to payment page
    navigate('/payment', { 
      state: { bookingData: { /* ... */ } }
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Troubleshooting

### Webhook Not Receiving Data

1. Check that `MAKE_WEBHOOK_URL` is set correctly in `.env`
2. Verify the webhook URL is active in Make.com
3. Check browser console for errors
4. Check server logs for error messages

### Timeout Errors

The webhook has a 10-second timeout. If Make.com is slow to respond:
- Increase the timeout in `makeWebhook.ts`
- Check Make.com scenario performance

### CORS Issues

If using from a different domain, ensure your Express server has CORS enabled:

```typescript
import cors from 'cors';
app.use(cors());
```
