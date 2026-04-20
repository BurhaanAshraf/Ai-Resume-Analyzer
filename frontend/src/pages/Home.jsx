import { useState, useEffect, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ResumeCard from '../components/ResumeCard.jsx';
import UploadModal from '../components/UploadModal.jsx';
import api from '../api/client.js';

export default function Home() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data.resumes);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Poll processing resumes every 5 seconds until all are done
  useEffect(() => {
    const hasProcessing = resumes.some((r) => r.status === 'processing' || r.status === 'pending');
    if (!hasProcessing) return;

    const interval = setInterval(fetchResumes, 5000);
    return () => clearInterval(interval);
  }, [resumes, fetchResumes]);

  function handleUploadSuccess(newResume) {
    setResumes((prev) => [newResume, ...prev]);
    setShowModal(false);
  }

  function handleDelete(id) {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <div className="spotlight top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-purple-600/15" />
      <div className="spotlight bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-indigo-900/10" />

      <Navbar onUpload={() => setShowModal(true)} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="text-xs text-purple-300 uppercase tracking-widest font-semibold">Live Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-3">
            Track Your Applications &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Resume Ratings
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            {!loading && resumes.length === 0
              ? 'Upload your first resume to get AI-driven feedback and improve your callback rate.'
              : 'Review your submissions and check AI-powered feedback.'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <UploadCloud className="w-10 h-10 text-purple-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">No resumes yet</h3>
              <p className="text-gray-400 text-sm">Upload your resume to get started</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500 transition-all px-7 py-3.5 rounded-full font-medium"
            >
              <UploadCloud className="w-5 h-5 text-purple-400 group-hover:-translate-y-0.5 transition-transform" />
              Upload Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
