import React, { useEffect, useState } from 'react';
import { X, History, Sparkles } from 'lucide-react';
import api from '../../api/client.js';

export const ActivityDrawer = ({ boardId, isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !boardId) return;

    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/boards/${boardId}/activities`);
        if (res.data.success) {
          setActivities(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load board activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  const renderActionText = (act) => {
    switch (act.action) {
      case 'CARD_CREATED':
        return (
          <span>
            created task <strong className="text-slate-200">{act.details?.cardTitle}</strong>
          </span>
        );
      case 'CARD_MOVED':
        return (
          <span>
            moved <strong className="text-slate-200">{act.details?.cardTitle}</strong> to{' '}
            <span className="capitalize text-indigo-400 font-medium">
              {act.details?.toStatus?.replace('_', ' ')}
            </span>
          </span>
        );
      case 'CARD_UPDATED':
        return (
          <span>
            updated task <strong className="text-slate-200">{act.details?.cardTitle}</strong>
          </span>
        );
      case 'CARD_DELETED':
        return (
          <span>
            deleted task <strong className="text-slate-200">{act.details?.cardTitle}</strong>
          </span>
        );
      case 'MEMBER_ADDED':
        return (
          <span>
            invited <strong className="text-slate-200">{act.details?.addedUser}</strong> to the board
          </span>
        );
      default:
        return <span>performed an action</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-slate-100">Board Activity</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-500 text-xs">
            Loading activity stream...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center p-8 text-slate-500 text-xs">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act._id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-850/60 border border-slate-800/80 text-xs"
            >
              <img
                src={
                  act.user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    act.user?.name || 'User'
                  )}`
                }
                alt={act.user?.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 leading-snug">
                  <span className="font-semibold text-slate-100">{act.user?.name}</span>{' '}
                  {renderActionText(act)}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {new Date(act.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  • {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
