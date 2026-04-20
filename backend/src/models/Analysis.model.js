import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    atsScore: { type: Number, required: true, min: 0, max: 100 },
    overallFeedback: { type: String, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    keywordAnalysis: {
      matched: [{ type: String }],
      missing: [{ type: String }],
      matchPercentage: { type: Number, min: 0, max: 100 },
    },
    sectionFeedback: {
      experience: { type: String },
      education: { type: String },
      skills: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Analysis', analysisSchema);
