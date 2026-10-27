import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, CheckCircle2, MoreVertical, Edit3, Trash2, ArrowRight } from 'lucide-react';

const priorityConfig = {
  urgent: { label: 'Urgent', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  high: { label: 'High', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  medium: { label: 'Medium', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  low: { label: 'Low', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
};

export const CardItem = ({
  card,
  index,
  onCardClick,
  onStatusChange,
  onDeleteCard,
  typingUsers,
}) => {
  const priority = priorityConfig[card.priority] || priorityConfig.medium;
  const isTyping = typingUsers && typingUsers[card._id];

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-slate-900/90 hover:bg-slate-850 rounded-xl p-4 mb-3 border transition-all duration-150 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/30 scale-105 z-50 bg-slate-800'
              : 'border-slate-800/80 hover:border-slate-700 shadow-sm'
          }`}
          onClick={() => onCardClick(card)}
        >
          {/* Real-time typing/editing indicator */}
          {isTyping && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              <span>{isTyping} is editing...</span>
            </div>
          )}

          {/* Top row: Priority & Status Toggle Dropdown */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priority.bg}`}
            >
              {priority.label}
            </span>

            {/* Quick Status Shift buttons for accessibility / alternative to drag */}
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {card.status !== 'todo' && (
                <button
                  onClick={() => onStatusChange(card._id, 'todo')}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Move to To Do"
                >
                  To Do
                </button>
              )}
              {card.status !== 'in_progress' && (
                <button
                  onClick={() => onStatusChange(card._id, 'in_progress')}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Move to In Progress"
                >
                  In Progress
                </button>
              )}
              {card.status !== 'done' && (
                <button
                  onClick={() => onStatusChange(card._id, 'done')}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800"
                  title="Move to Done"
                >
                  Done
                </button>
              )}
            </div>
          </div>

          {/* Card Title */}
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug line-clamp-2 mb-1.5">
            {card.title}
          </h4>

          {/* Card Description */}
          {card.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {card.description}
            </p>
          )}

          {/* Footer: Due date & Assignee avatar */}
          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-1.5">
              {card.dueDate ? (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(card.dueDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  {new Date(card.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            {card.assignee ? (
              <img
                src={
                  card.assignee.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    card.assignee.name
                  )}`
                }
                alt={card.assignee.name}
                title={`Assigned to ${card.assignee.name}`}
                className="w-5 h-5 rounded-full ring-1 ring-slate-700 object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-600 italic">Unassigned</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
