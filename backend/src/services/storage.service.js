import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloud(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const publicId = `resumes/${Date.now()}-${originalName.replace(/\s+/g, '_').replace('.pdf', '')}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',   // PDFs must use 'raw'
        public_id: publicId,
        format: 'pdf',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloud(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
}
