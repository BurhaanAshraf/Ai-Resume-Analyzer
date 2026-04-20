import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getAnalysis, retryAnalysis } from '../controllers/analysis.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:resumeId', getAnalysis);
router.post('/:resumeId/retry', retryAnalysis);

export default router;
