import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

export const AddCardModal = ({
  columnId,
  boardId,
  members,
  onClose,
  onCreateCard,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onCreateCard({
        boardId,
        title: title.trim(),
        description: description.trim(),
        status: columnId,
        priority,
        assignee: assignee || null,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#383139]/40 backdrop-blur-sm animate-in fade-in duration-180">
      <div className="bg-[#fffdf7] border border-white rounded-[38px] w-full max-w-md shadow-[0_24px_60px_-15px_rgba(56,49,57,0.2),inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(56,49,57,0.05)] overflow-hidden">
        {/* Header */}
        <div className="px-7 py-5 border-b border-[#f1f2fa] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f6a3ca] shadow-[0_4px_10px_-2px_rgba(246,163,202,0.6),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_2px_rgba(180,80,130,0.2)] flex items-center justify-center text-[#383139]">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-base text-[#383139]">
              Add New Card
            </h3>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#fcd2df] text-[#8c2340] text-xs font-semibold flex items-center gap-2 shadow-[inset_1.5px_1.5px_3px_rgba(180,60,90,0.15)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#383139] mb-1.5 uppercase tracking-wider">
              Card Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-semibold transition-all placeholder:text-[#8e8a94]"
              placeholder="e.g. Write integration test suite"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl clay-inset-well text-sm font-medium transition-all resize-none placeholder:text-[#8e8a94]"
              placeholder="Add key objectives or criteria..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                        {u.name}
                      </option>
                    );
                  })}
              </select>
            </div>
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

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#f1f2fa] hover:bg-[#e6e8f5] text-[#383139] text-xs font-bold shadow-[0_3px_8px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_2px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_2px_rgba(56,49,57,0.06)] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
