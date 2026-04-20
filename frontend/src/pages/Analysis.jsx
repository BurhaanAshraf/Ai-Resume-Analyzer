import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Lightbulb, Tag, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ScoreCircle from '../components/ScoreCircle.jsx';
import api from '../api/client.js';

export default function Analysis() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [resumeRes, analysisRes] = await Promise.all([
          api.get(`/resumes/${resumeId}`),
          api.get(`/analysis/${resumeId}`),
        ]);
        setResume(resumeRes.data.resume);
        setData(analysisRes.data.analysis);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resumeId]);

  async function handleRetry() {
    setRetrying(true);
    try {
      await api.post(`/analysis/${resumeId}/retry`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retry');
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-300 text-center">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="btn-ghost px-6">
            Go Back
          </button>
          <button onClick={handleRetry} disabled={retrying} className="btn-primary px-6 flex items-center gap-2">
            {retrying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { atsScore, overallFeedback, strengths, improvements, keywordAnalysis, sectionFeedback } = data;

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <div className="spotlight top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-purple-600/12" />

      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-10 animate-slide-up">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {resume && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">
              {resume.companyName}
            </h1>
            <p className="text-gray-400">{resume.jobTitle}</p>
          </div>
        )}

        {/* Score + Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="card p-6 flex flex-col items-center justify-center">
            <ScoreCircle score={atsScore} size={140} />
          </div>

          <div className="card p-6 md:col-span-2">
            <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-3">
              Overall Feedback
            </h2>
            <p className="text-gray-300 leading-relaxed">{overallFeedback}</p>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Keyword Match</span>
                <span className="font-semibold text-white">{keywordAnalysis.matchPercentage}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${keywordAnalysis.matchPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-semibold text-green-300 uppercase tracking-wider">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Improvements</h2>
            </div>
            <ul className="space-y-2">
              {improvements.map((imp, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                  <span className="text-yellow-400 mt-0.5 shrink-0">→</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Keywords */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Keyword Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-3">Matched</h3>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.matched.length > 0 ? (
                  keywordAnalysis.matched.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-300 text-xs rounded-full">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">None detected</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-3">Missing</h3>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.missing.length > 0 ? (
                  keywordAnalysis.missing.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-full">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">None missing</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {Object.entries(sectionFeedback).map(([section, feedback]) => (
            feedback && (
              <div key={section} className="card p-5">
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3 capitalize">
                  {section}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feedback}</p>
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
