import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import api from '../api/client.js';
import {
  Plus,
  Search,
  Kanban,
  Users,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  Sparkles,
  Bell,
} from 'lucide-react';

export const DashboardPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteNotification, setInviteNotification] = useState(null);

  const { socket } = useSocket();
  const location = useLocation();

  const fetchBoards = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/boards');
      if (res.data.success) {
        setBoards(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Automatically refresh when navigating to the main page or switching tabs
  useEffect(() => {
    fetchBoards();

    const handleFocus = () => {
      fetchBoards(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBoards, location.key]);

  // Real-time socket listener for instant board invitation without refresh
  useEffect(() => {
    if (!socket) return;

    const handleBoardInvited = ({ board, invitedBy }) => {
      setBoards((prev) => {
        if (prev.some((b) => b._id === board._id)) return prev;
        return [board, ...prev];
      });

      // Show friendly animated toast notification
      setInviteNotification({
        title: board.title,
        invitedBy: invitedBy?.name || 'A team member',
        boardId: board._id,
      });

      setTimeout(() => {
        setInviteNotification(null);
      }, 7000);
    };

    const handleBoardDeleted = ({ boardId }) => {
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
    };

    socket.on('board:invited', handleBoardInvited);
    socket.on('board:deleted', handleBoardDeleted);

    return () => {
      socket.off('board:invited', handleBoardInvited);
      socket.off('board:deleted', handleBoardDeleted);
    };
  }, [socket]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Board title is required');
      return;
    }

    setIsSubmitting(true);
    setCreateError('');

    try {
      const res = await api.post('/boards', {
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      if (res.data.success) {
        setBoards([res.data.data, ...boards]);
        setNewTitle('');
        setNewDescription('');
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      setCreateError(
        err.response?.data?.message || err.message || 'Failed to create board'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBoard = async (e, boardId, title) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to permanently delete "${title}" and all its tasks?`)) {
      try {
        await api.delete(`/boards/${boardId}`);
        setBoards(boards.filter((b) => b._id !== boardId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete board');
      }
    }
  };

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f2fa] text-[#383139] flex flex-col font-sans">
      <Navbar />

      {/* Real-Time Live Invite Notification Toast */}
      {inviteNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 max-w-sm">
          <div className="p-4 rounded-[26px] bg-[#fffdf7] border-2 border-[#f6a3ca] shadow-[0_18px_40px_-10px_rgba(246,163,202,0.6),inset_2px_2px_4px_rgba(255,255,255,0.95)] flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f6a3ca] flex items-center justify-center text-[#383139] shrink-0 shadow-sm mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#383139]">New Workspace Invitation!</h4>
              <p className="text-xs text-[#48404b] mt-0.5">
                <span className="font-bold">{inviteNotification.invitedBy}</span> added you to{' '}
                <span className="font-bold text-[#c74c83]">"{inviteNotification.title}"</span>.
              </p>
              <Link
                to={`/board/${inviteNotification.boardId}`}
                className="inline-block mt-2 px-3.5 py-1 rounded-full bg-[#ded0f9] text-[#4b3378] text-[11px] font-bold shadow-sm hover:bg-[#d4c2f6] transition-colors"
              >
                Open Workspace →
              </Link>
            </div>
            <button
              onClick={() => setInviteNotification(null)}
              className="text-[#8e8a94] hover:text-[#383139] text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Claymorphic Hero Cushion */}
        <div className="rounded-[40px] bg-[#f6a3ca] shadow-[0_20px_40px_-12px_rgba(246,163,202,0.6),inset_4px_4px_8px_rgba(255,255,255,0.85),inset_-4px_-4px_10px_rgba(180,80,130,0.25)] p-8 sm:p-10 mb-8 relative overflow-hidden">
          {/* Molded Decorative Overlapping Objects */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#ded0f9] shadow-[0_12px_30px_-6px_rgba(222,208,249,0.7),inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-3px_-3px_6px_rgba(130,100,180,0.2)] pointer-events-none" />
          <div className="absolute bottom-4 -right-2 w-28 h-28 rounded-full bg-[#c0efdc] shadow-[0_10px_25px_-5px_rgba(192,239,220,0.7),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(90,160,130,0.2)] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-3xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(56,49,57,0.08)] text-xs font-bold text-[#383139] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#e273a5]" />
                <span>Collaborative Workspaces</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#383139] tracking-tight leading-tight">
                Your Projects & Boards
              </h1>
              <p className="text-sm font-medium text-[#48404b] mt-2 max-w-xl leading-relaxed">
                Open an existing board to collaborate with your team in real time, or create a brand new workspace.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3.5 rounded-full clay-btn-pill clay-btn-cream text-sm font-bold shadow-[0_8px_20px_-4px_rgba(56,49,57,0.12)] shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Board</span>
            </button>
          </div>
        </div>

        {/* Search Bar - Recessed Inset Well */}
        <div className="relative max-w-md mb-8">
          <Search className="w-4 h-4 text-[#8e8a94] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold placeholder:text-[#8e8a94]"
          />
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 rounded-[32px] bg-[#fffdf7] border border-white shadow-[0_12px_28px_-8px_rgba(56,49,57,0.08),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_5px_rgba(56,49,57,0.04)] animate-pulse p-6"
              >
                <div className="h-6 w-2/3 bg-[#eceef8] rounded-full mb-4"></div>
                <div className="h-4 w-full bg-[#eceef8] rounded-full mb-2"></div>
                <div className="h-4 w-1/2 bg-[#eceef8] rounded-full mb-8"></div>
                <div className="h-9 w-full bg-[#eceef8] rounded-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBoards.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-[38px] bg-[#fffdf7] border border-white shadow-[0_16px_36px_-12px_rgba(56,49,57,0.08),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.04)] my-8">
            <div className="w-16 h-16 rounded-full bg-[#ded0f9] shadow-[0_8px_20px_-4px_rgba(222,208,249,0.7),inset_2px_2px_4px_rgba(255,255,255,0.85),inset_-2px_-2px_4px_rgba(130,100,180,0.2)] flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-[#4b3378]" />
            </div>
            <h3 className="text-xl font-bold text-[#383139] mb-1">No Boards Found</h3>
            <p className="text-xs font-medium text-[#48404b] max-w-sm mb-6">
              {search
                ? `No boards match your search query "${search}".`
                : 'Get started by creating your first collaborative Kanban workspace.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Create First Board
            </button>
          </div>
        )}

        {/* Boards Grid - Molded Cream Cushions */}
        {!loading && filteredBoards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="group flex flex-col justify-between rounded-[32px] bg-[#fffdf7] border border-white shadow-[0_12px_28px_-8px_rgba(56,49,57,0.08),inset_2.5px_2.5px_5px_rgba(255,255,255,0.95),inset_-2.5px_-2.5px_6px_rgba(56,49,57,0.05)] hover:shadow-[0_18px_36px_-6px_rgba(56,49,57,0.12),inset_2.5px_2.5px_5px_rgba(255,255,255,0.95),inset_-2.5px_-2.5px_6px_rgba(56,49,57,0.05)] hover:-translate-y-1 p-6 transition-all duration-180"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-lg text-[#383139] group-hover:text-[#c74c83] transition-colors line-clamp-1">
                      {board.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteBoard(e, board._id, board.title)}
                      className="p-2 rounded-full text-[#8e8a94] hover:text-[#c9345e] hover:bg-[#fcd2df] opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                      title="Delete board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-medium text-[#48404b] line-clamp-2 min-h-[34px] mb-5 leading-relaxed">
                    {board.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#f1f2fa] flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    {/* Card Count Pill */}
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ded0f9] text-[#4b3378] shadow-[0_2px_6px_-1px_rgba(222,208,249,0.7),inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                      <Kanban className="w-3.5 h-3.5" />
                      <span>{board.cardCount ?? 0}</span>
                    </span>

                    {/* Members Pill */}
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c0efdc] text-[#1c573c] shadow-[0_2px_6px_-1px_rgba(192,239,220,0.7),inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{board.members?.length || 1}</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[#c74c83] group-hover:translate-x-1 transition-transform">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal - Soft Cream Molded Tray */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#383139]/40 backdrop-blur-sm animate-in fade-in duration-180">
          <div className="bg-[#fffdf7] border border-white rounded-[38px] w-full max-w-md shadow-[0_24px_60px_-15px_rgba(56,49,57,0.2),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.05)] p-7">
            <h3 className="text-xl font-bold text-[#383139] mb-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f6a3ca] shadow-[0_4px_10px_-2px_rgba(246,163,202,0.6),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8)] flex items-center justify-center text-[#383139]">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              Create New Board
            </h3>

            {createError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#fcd2df] text-[#8c2340] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,60,90,0.15)]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                  Board Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q4 Sprint & Feature Tracker"
                  className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold placeholder:text-[#8e8a94]"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline purpose or goals..."
                  className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-medium resize-none placeholder:text-[#8e8a94]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#f1f2fa] hover:bg-[#e6e8f5] text-[#383139] text-xs font-bold shadow-[0_3px_8px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_2px_rgba(255,255,255,0.95)] active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
