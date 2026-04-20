import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadResume as multerUpload, handleUploadError } from '../middleware/upload.middleware.js';
import {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
} from '../controllers/resume.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', multerUpload, handleUploadError, uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

export default router;
