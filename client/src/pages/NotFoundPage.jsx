import React from 'react';
import { Link } from 'react-router-dom';
import { KanbanSquare, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#f1f2fa] text-[#383139] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 rounded-full bg-[#f6a3ca] shadow-[0_12px_28px_-6px_rgba(246,163,202,0.6),inset_3px_3px_6px_rgba(255,255,255,0.85),inset_-3px_-3px_6px_rgba(180,80,130,0.2)] flex items-center justify-center mb-6">
        <KanbanSquare className="w-10 h-10 text-[#383139]" />
      </div>
      <h1 className="text-6xl font-extrabold text-[#383139] mb-2 tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-[#383139] mb-3">Page Not Found</h2>
      <p className="text-sm font-medium text-[#48404b] max-w-sm mb-8 leading-relaxed">
        The workspace or board you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3.5 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> Return to Dashboard
      </Link>
    </div>
  );
};
