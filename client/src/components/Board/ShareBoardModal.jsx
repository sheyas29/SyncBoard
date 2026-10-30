import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, User, Check, AlertCircle } from 'lucide-react';
import api from '../../api/client.js';

export const ShareBoardModal = ({ board, onClose, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Escape key handler to close dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post(`/boards/${board._id}/members`, {
        email: email.trim().toLowerCase(),
      });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Collaborator added!');
        setEmail('');
        if (onMemberAdded) {
          onMemberAdded(res.data.data);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to add collaborator'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-board-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#383139]/40 backdrop-blur-sm animate-in fade-in duration-180"
    >
      <div className="bg-[#fffdf7] border border-white rounded-[38px] w-full max-w-md shadow-[0_24px_60px_-15px_rgba(56,49,57,0.2),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.05)] overflow-hidden">
        {/* Header */}
        <div className="px-7 py-5 border-b border-[#f1f2fa] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ded0f9] shadow-[0_4px_10px_-2px_rgba(222,208,249,0.6),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_2px_rgba(130,100,180,0.2)] flex items-center justify-center text-[#383139]">
              <UserPlus className="w-4 h-4 text-[#4b3378]" />
            </div>
            <h2 id="share-board-title" className="font-bold text-base text-[#383139]">
              Board Collaborators
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f1f2fa] hover:bg-[#e4e6f4] text-[#383139] shadow-[0_3px_8px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.06)] active:scale-95 transition-all flex items-center justify-center"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 space-y-5">
          {/* Invite Input */}
          <form onSubmit={handleAddMember} className="space-y-3">
            <label className="block text-xs font-bold text-[#383139] uppercase tracking-wider">
              Invite by Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#58515f]"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold shrink-0 disabled:opacity-50"
              >
                {isSubmitting ? 'Inviting...' : 'Invite'}
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#fcd2df] text-[#8c2340] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,60,90,0.15)]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-[#c0efdc] text-[#1c573c] text-xs font-bold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(90,160,130,0.2)]">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>

          {/* Members List */}
          <div className="border-t border-[#f1f2fa] pt-4">
            <h3 className="text-xs font-bold text-[#58515f] uppercase tracking-wider mb-3">
              Active Members ({board.members?.length || 0})
            </h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {/* Owner */}
              {board.owner && (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f7f6fc] shadow-[inset_1px_1px_2px_rgba(56,49,57,0.06),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        board.owner.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          board.owner.name
                        )}`
                      }
                      alt={board.owner.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#383139]">
                        {board.owner.name}
                      </p>
                      <p className="text-xs text-[#58515f] font-medium">{board.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#f6a3ca] text-[#383139] shadow-[0_2px_6px_-1px_rgba(246,163,202,0.6),inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                    Owner
                  </span>
                </div>
              )}

              {/* Members */}
              {board.members &&
                board.members
                  .filter((m) => (m.user?._id || m.user) !== board.owner?._id)
                  .map((m, index) => {
                    const u = m.user || m;
                    return (
                      <div
                        key={u._id || index}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f7f6fc] shadow-[inset_1px_1px_2px_rgba(56,49,57,0.06),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                u.name || 'User'
                              )}`
                            }
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#383139]">
                              {u.name}
                            </p>
                            <p className="text-xs text-[#58515f] font-medium">{u.email}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#e6e8f5] text-[#383139]">
                          {m.role || 'Member'}
                        </span>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
