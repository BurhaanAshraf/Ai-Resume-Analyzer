import Analysis from '../models/Analysis.model.js';
import Resume from '../models/Resume.model.js';
import { analyzeResume } from '../services/ai.service.js';

export async function getAnalysis(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const analysis = await Analysis.findOne({ resume: resume._id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not ready yet', status: resume.status });
    }

    res.json({ analysis: formatAnalysis(analysis) });
  } catch (err) {
    next(err);
  }
}

export async function retryAnalysis(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    if (resume.status === 'processing') {
      return res.status(409).json({ message: 'Analysis already in progress' });
    }

    if (!resume.extractedText) {
      return res.status(422).json({ message: 'No text extracted from resume' });
    }

    await Resume.findByIdAndUpdate(resume._id, { status: 'processing' });
    await Analysis.deleteOne({ resume: resume._id });

    analyzeResume({
      resumeText: resume.extractedText,
      jobDescription: resume.jobDescription,
      jobTitle: resume.jobTitle,
      companyName: resume.companyName,
    })
      .then(async (result) => {
        await Analysis.create({ resume: resume._id, user: req.user._id, ...result });
        await Resume.findByIdAndUpdate(resume._id, { status: 'analyzed' });
      })
      .catch(async (err) => {
        console.error('Retry analysis failed:', err);
        await Resume.findByIdAndUpdate(resume._id, { status: 'failed' });
      });

    res.json({ message: 'Analysis restarted' });
  } catch (err) {
    next(err);
  }
}

function formatAnalysis(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    resumeId: obj.resume,
    atsScore: obj.atsScore,
    overallFeedback: obj.overallFeedback,
    strengths: obj.strengths,
    improvements: obj.improvements,
    keywordAnalysis: obj.keywordAnalysis,
    sectionFeedback: obj.sectionFeedback,
    createdAt: obj.createdAt,
  };
}
