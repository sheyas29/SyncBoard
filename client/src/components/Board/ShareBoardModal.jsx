import React, { useState } from 'react';
import { X, UserPlus, Shield, User, Check, AlertCircle } from 'lucide-react';
import api from '../../api/client.js';

export const ShareBoardModal = ({ board, onClose, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">Board Collaborators</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Invite Input */}
          <form onSubmit={handleAddMember} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Invite by Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? 'Inviting...' : 'Invite'}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>

          {/* Members List */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Active Members ({board.members?.length || 0})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {/* Owner */}
              {board.owner && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        board.owner.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          board.owner.name
                        )}`
                      }
                      alt={board.owner.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {board.owner.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{board.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800"
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
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
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
