import express from 'express';
import webhookController from '../controllers/webhookController';

const router = express.Router();

// webhook
router.get('/webhook/', webhookController.tokenVerification);
router.post('/webhook/', webhookController.messageReceive);

export default router;