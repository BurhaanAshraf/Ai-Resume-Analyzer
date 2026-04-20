import Resume from '../models/Resume.model.js';
import Analysis from '../models/Analysis.model.js';
import { uploadToCloud, deleteFromCloud } from '../services/storage.service.js';
import { extractTextFromBuffer } from '../services/pdf.service.js';
import { analyzeResume } from '../services/ai.service.js';

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const { companyName, jobTitle, jobDescription } = req.body;
    if (!companyName || !jobTitle || !jobDescription) {
      return res.status(400).json({ message: 'companyName, jobTitle, and jobDescription are required' });
    }

    // Extract text from buffer before uploading (fail fast on corrupt PDFs)
    let extractedText;
    try {
      extractedText = await extractTextFromBuffer(req.file.buffer);
    } catch {
      return res.status(422).json({ message: 'Failed to parse PDF. Ensure the file is not corrupted.' });
    }

    // Upload PDF buffer to Cloudinary
    let cloudFile;
    try {
      cloudFile = await uploadToCloud(req.file.buffer, req.file.originalname);
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({ message: 'Failed to store resume. Please try again.' });
    }

    const resume = await Resume.create({
      user: req.user._id,
      companyName,
      jobTitle,
      jobDescription,
      fileName: req.file.originalname,
      fileUrl: cloudFile.url,
      cloudPublicId: cloudFile.publicId,
      fileSize: req.file.size,
      extractedText,
      status: 'processing',
    });

    // Run AI analysis asynchronously — respond immediately
    analyzeResume({ resumeText: extractedText, jobDescription, jobTitle, companyName })
      .then(async (result) => {
        await Analysis.create({ resume: resume._id, user: req.user._id, ...result });
        await Resume.findByIdAndUpdate(resume._id, { status: 'analyzed' });
      })
      .catch(async (err) => {
        console.error('Analysis failed:', err);
        await Resume.findByIdAndUpdate(resume._id, { status: 'failed' });
      });

    res.status(201).json({ resume: formatResume(resume) });
  } catch (err) {
    next(err);
  }
}

export async function getResumes(req, res, next) {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-extractedText');

    res.json({ resumes: resumes.map(formatResume) });
  } catch (err) {
    next(err);
  }
}

export async function getResume(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id }).select('-extractedText');
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    res.json({ resume: formatResume(resume) });
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    // Delete from Cloudinary
    await deleteFromCloud(resume.cloudPublicId);

    await Analysis.deleteOne({ resume: resume._id });
    await resume.deleteOne();

    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
}

function formatResume(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    companyName: obj.companyName,
    jobTitle: obj.jobTitle,
    jobDescription: obj.jobDescription,
    fileName: obj.fileName,
    fileUrl: obj.fileUrl,
    fileSize: obj.fileSize,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}
