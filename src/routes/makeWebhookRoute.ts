import express from 'express';
import { handleMakeWebhook } from '../utils/makeWebhook';

const router = express.Router();

/**
 * POST /api/make-webhook
 * Send booking data to Make.com webhook
 * 
 * Request Body:
 * {
 *   "clientName": "string (required)",
 *   "phone": "string (required)",
 *   "email": "string (optional)",
 *   "eventType": "string (required)",
 *   "eventDate": "string (required, ISO format)",
 *   "location": "string (optional)",
 *   "notes": "string (optional)",
 *   "packageName": "string (optional)",
 *   "totalPrice": "number (optional)"
 * }
 * 
 * Response:
 * {
 *   "success": true/false,
 *   "message": "string",
 *   "data": "any (optional)"
 * }
 */
router.post('/make-webhook', handleMakeWebhook);

export default router;
