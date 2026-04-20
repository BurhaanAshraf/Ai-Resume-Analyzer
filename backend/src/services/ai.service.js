import Groq from 'groq-sdk';

let client;

function getClient() {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and career coach.
Analyze the provided resume against the job description and return ONLY valid JSON — no markdown, no explanation.
The JSON must match this exact schema:
{
  "atsScore": <number 0-100>,
  "overallFeedback": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "..."],
  "improvements": ["<improvement 1>", "<improvement 2>", "..."],
  "keywordAnalysis": {
    "matched": ["<keyword>", "..."],
    "missing": ["<keyword>", "..."],
    "matchPercentage": <number 0-100>
  },
  "sectionFeedback": {
    "experience": "<feedback on work experience section>",
    "education": "<feedback on education section>",
    "skills": "<feedback on skills section>"
  }
}`;

export async function analyzeResume({ resumeText, jobDescription, jobTitle, companyName }) {
  const userMessage = `
Company: ${companyName}
Job Title: ${jobTitle}

--- JOB DESCRIPTION ---
${jobDescription}

--- RESUME ---
${resumeText}
`.trim();

  const response = await getClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  const parsed = JSON.parse(raw);

  return {
    atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
    overallFeedback: parsed.overallFeedback || '',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    keywordAnalysis: {
      matched: Array.isArray(parsed.keywordAnalysis?.matched) ? parsed.keywordAnalysis.matched : [],
      missing: Array.isArray(parsed.keywordAnalysis?.missing) ? parsed.keywordAnalysis.missing : [],
      matchPercentage: Number(parsed.keywordAnalysis?.matchPercentage) || 0,
    },
    sectionFeedback: {
      experience: parsed.sectionFeedback?.experience || '',
      education: parsed.sectionFeedback?.education || '',
      skills: parsed.sectionFeedback?.skills || '',
    },
  };
}
