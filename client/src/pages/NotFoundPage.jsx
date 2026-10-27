import React from 'react';
import { Link } from 'react-router-dom';
import { KanbanSquare, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
        <KanbanSquare className="w-8 h-8 text-indigo-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-200 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The workspace or board you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};
