import { useState, useRef } from 'react';
import { X, UploadCloud, FileText, HelpCircle, Loader2 } from 'lucide-react';
import api from '../api/client.js';

export default function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ companyName: '', jobTitle: '', jobDescription: '' });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleFile(f) {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File must be under 20 MB');
      return;
    }
    setFile(f);
    setError('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please upload a PDF resume');
      return;
    }

    const data = new FormData();
    data.append('resume', file);
    data.append('companyName', form.companyName);
    data.append('jobTitle', form.jobTitle);
    data.append('jobDescription', form.jobDescription);

    setLoading(true);
    try {
      const res = await api.post('/resumes', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg card border border-white/10 shadow-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">New Application</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name</label>
            <input
              name="companyName"
              type="text"
              required
              placeholder="e.g. Google, Stripe"
              value={form.companyName}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title</label>
            <input
              name="jobTitle"
              type="text"
              required
              placeholder="e.g. Frontend Engineer"
              value={form.jobTitle}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Description</label>
            <textarea
              name="jobDescription"
              rows={4}
              required
              placeholder="Paste the job requirements here..."
              value={form.jobDescription}
              onChange={handleChange}
              className="input-field resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-300">Resume (PDF)</label>
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </div>

            {file ? (
              <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                  ${dragging
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-purple-500/50 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-sm text-gray-300 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF (max 20 MB)</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Analyse Resume'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
