import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, Clock, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import api from '../api/client.js';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending', bg: 'bg-yellow-400/10' },
  processing: { icon: Loader2, color: 'text-blue-400', label: 'Analysing...', bg: 'bg-blue-400/10', spin: true },
  analyzed: { icon: CheckCircle, color: 'text-green-400', label: 'Analysed', bg: 'bg-green-400/10' },
  failed: { icon: AlertCircle, color: 'text-red-400', label: 'Failed', bg: 'bg-red-400/10' },
};

export default function ResumeCard({ resume, onDelete }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[resume.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${resume.companyName}" resume? This cannot be undone.`)) return;
    try {
      await api.delete(`/resumes/${resume.id}`);
      onDelete(resume.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resume');
    }
  }

  function handleClick() {
    if (resume.status === 'analyzed') {
      navigate(`/analysis/${resume.id}`);
    }
  }

  const isClickable = resume.status === 'analyzed';

  return (
    <div
      onClick={handleClick}
      className={`card p-5 flex flex-col gap-4 transition-all duration-200 group
        ${isClickable ? 'cursor-pointer hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]' : 'cursor-default'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <h3 className="font-semibold text-white truncate">{resume.companyName}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{resume.jobTitle}</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
          aria-label="Delete resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.spin ? 'animate-spin' : ''}`} />
          {cfg.label}
        </div>

        <span className="text-xs text-gray-500">
          {new Date(resume.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {isClickable && (
        <div className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
          Click to view analysis →
        </div>
      )}
    </div>
  );
}
