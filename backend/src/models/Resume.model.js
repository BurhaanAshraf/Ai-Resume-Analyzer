import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },      // Cloudinary secure URL
    cloudPublicId: { type: String, required: true }, // for deletion
    fileSize: { type: Number, required: true },
    extractedText: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'analyzed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
