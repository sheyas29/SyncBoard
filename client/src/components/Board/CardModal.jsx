import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, User, Tag, Clock, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const CardModal = ({
  card,
  boardId,
  members,
  onClose,
  onUpdateCard,
  onDeleteCard,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [status, setStatus] = useState(card.status || 'todo');
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [assignee, setAssignee] = useState(card.assignee?._id || '');
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Escape key handler to close dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !card._id) return;

    let timeoutId;
    const handleTyping = () => {
      socket.emit('card:typing', {
        boardId,
        cardId: card._id,
        userName: user?.name || 'Someone',
        isTyping: true,
      });

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        socket.emit('card:typing', {
          boardId,
          cardId: card._id,
          userName: user?.name,
          isTyping: false,
        });
      }, 1500);
    };

    if (title !== card.title || description !== card.description) {
      handleTyping();
    }

    return () => {
      clearTimeout(timeoutId);
      socket.emit('card:typing', {
        boardId,
        cardId: card._id,
        userName: user?.name,
        isTyping: false,
      });
    };
  }, [title, description, socket, boardId, card._id, user?.name, card.title, card.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Card title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onUpdateCard(card._id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignee || null,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      try {
        await onDeleteCard(card._id);
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete card');
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#383139]/40 backdrop-blur-sm animate-in fade-in duration-180"
    >
      <div className="bg-[#fffdf7] border border-white rounded-[38px] w-full max-w-lg shadow-[0_24px_60px_-15px_rgba(56,49,57,0.2),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.05)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-7 py-5 border-b border-[#f1f2fa] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="card-modal-title" className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#ded0f9] text-[#4b3378] shadow-[0_3px_8px_-2px_rgba(222,208,249,0.7),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(130,100,180,0.15)]">
              Task Details
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

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#fcd2df] text-[#8c2340] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,60,90,0.15)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all"
              placeholder="e.g. Design User Flow"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-medium transition-all resize-none"
              placeholder="Add details, acceptance criteria, or notes..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold"
              >
                <option value="">Unassigned</option>
                {members &&
                  members.map((m) => {
                    const u = m.user || m;
                    return (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-[#f1f2fa] bg-[#faf9fe] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fcd2df] hover:bg-[#fabecf] text-[#8c2340] text-xs font-bold shadow-[0_3px_8px_-2px_rgba(252,210,223,0.7),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(180,60,90,0.15)] active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Task
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#f1f2fa] hover:bg-[#e6e8f5] text-[#383139] text-xs font-bold shadow-[0_3px_8px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_2px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_2px_rgba(56,49,57,0.06)] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
