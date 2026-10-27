import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
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

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards');
      if (res.data.success) {
        setBoards(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Workspaces & Boards
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select an active board to collaborate or launch a new project
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
          />
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse p-6"
              >
                <div className="h-6 w-2/3 bg-slate-800 rounded-lg mb-3"></div>
                <div className="h-4 w-full bg-slate-800 rounded-lg mb-2"></div>
                <div className="h-4 w-1/2 bg-slate-800 rounded-lg mb-6"></div>
                <div className="h-8 w-full bg-slate-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBoards.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Boards Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              {search
                ? `No boards match your search query "${search}".`
                : 'Get started by creating your first collaborative Kanban board.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Board
            </button>
          </div>
        )}

        {/* Boards Grid */}
        {!loading && filteredBoards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="group flex flex-col justify-between rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 p-6 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {board.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteBoard(e, board._id, board.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-5">
                    {board.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Kanban className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{board.cardCount ?? 0} cards</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{board.members?.length || 1} members</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform font-medium">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Create New Board
            </h3>

            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Board Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q4 Sprint & Feature Tracker"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline purpose or goals..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
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
