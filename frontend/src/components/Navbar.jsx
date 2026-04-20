import { useState, useEffect, useRef } from 'react';
import { FileText, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onUpload }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  return (
    <nav className="relative z-30 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-wide">AI Resume Analyser</span>
      </div>

      <div className="flex items-center gap-3">
        {onUpload && (
          <button
            onClick={onUpload}
            className="bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-medium px-5 py-2 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.3)]"
          >
            Upload Resume
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-gray-300 max-w-[120px] truncate">{user?.name}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card border border-white/10 shadow-xl animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-b-2xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
