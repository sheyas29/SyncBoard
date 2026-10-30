import React, { useEffect, useState } from 'react';
import { X, History } from 'lucide-react';
import api from '../../api/client.js';

export const ActivityDrawer = ({ boardId, isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !boardId) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, boardId, onClose]);

  if (!isOpen) return null;

  const renderActionText = (act) => {
    switch (act.action) {
      case 'CARD_CREATED':
        return (
          <span>
            created task <strong className="text-[#383139]">{act.details?.cardTitle}</strong>
          </span>
        );
      case 'CARD_MOVED':
        return (
          <span>
            moved <strong className="text-[#383139]">{act.details?.cardTitle}</strong> to{' '}
            <span className="capitalize font-bold text-[#8264b4]">
              {act.details?.toStatus?.replace('_', ' ')}
            </span>
          </span>
        );
      case 'CARD_UPDATED':
        return (
          <span>
            updated task <strong className="text-[#383139]">{act.details?.cardTitle}</strong>
          </span>
        );
      case 'CARD_DELETED':
        return (
          <span>
            deleted task <strong className="text-[#383139]">{act.details?.cardTitle}</strong>
          </span>
        );
      case 'MEMBER_ADDED':
        return (
          <span>
            invited <strong className="text-[#383139]">{act.details?.addedUser}</strong> to the board
          </span>
        );
      default:
        return <span>performed an action</span>;
    }
  };

  return (
    <div
      role="region"
      aria-label="Board Activity Log"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#fffdf7] border-l border-white shadow-[0_20px_50px_-10px_rgba(56,49,57,0.2),inset_3px_0_6px_rgba(255,255,255,0.95)] flex flex-col animate-in slide-in-from-right duration-180"
    >
      {/* Header */}
      <div className="p-5 border-b border-[#f1f2fa] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#ded0f9] shadow-[0_4px_10px_-2px_rgba(222,208,249,0.6),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_2px_rgba(130,100,180,0.2)] flex items-center justify-center text-[#383139]">
            <History className="w-4 h-4 text-[#4b3378]" />
          </div>
          <h2 className="font-bold text-base text-[#383139]">Board Activity</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#f1f2fa] hover:bg-[#e4e6f4] text-[#383139] shadow-[0_3px_8px_-2px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.06)] active:scale-95 transition-all flex items-center justify-center"
          title="Close drawer"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-[#58515f] text-xs font-semibold">
            Loading activity stream...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center p-8 text-[#58515f] text-xs font-medium">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act._id}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f7f6fc] border border-white shadow-[0_4px_12px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.04)] text-xs"
            >
              <img
                src={
                  act.user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    act.user?.name || 'User'
                  )}`
                }
                alt={act.user?.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[#48404b] leading-snug">
                  <span className="font-bold text-[#383139]">{act.user?.name}</span>{' '}
                  {renderActionText(act)}
                </p>
                <span className="text-xs font-semibold text-[#58515f] mt-1 block">
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
