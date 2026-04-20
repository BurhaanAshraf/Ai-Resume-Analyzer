import multer from 'multer';

function fileFilter(_req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
}

// Memory storage — file goes to Cloudinary, never touches local disk
export const uploadResume = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).single('resume');

export function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError || err?.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
}
