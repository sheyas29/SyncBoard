import React from 'react';
import ReactDOM from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, ChevronsUp, ChevronUp, Minus, ChevronDown, AlertCircle } from 'lucide-react';

const priorityBadges = {
  urgent: {
    label: 'Urgent',
    icon: ChevronsUp,
    classes: 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] shadow-[0_2px_6px_-1px_rgba(239,68,68,0.15)]',
  },
  high: {
    label: 'High',
    icon: ChevronUp,
    classes: 'bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] shadow-[0_2px_6px_-1px_rgba(249,115,22,0.15)]',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    classes: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] shadow-[0_2px_6px_-1px_rgba(59,130,246,0.15)]',
  },
  low: {
    label: 'Low',
    icon: ChevronDown,
    classes: 'bg-[#f8fafc] text-[#475569] border border-[#cbd5e1] shadow-[0_2px_6px_-1px_rgba(100,116,139,0.12)]',
  },
};

export const CardItem = ({
  card,
  index,
  onCardClick,
  onStatusChange,
  onDeleteCard,
  typingUsers,
}) => {
  const priority = priorityBadges[card.priority] || priorityBadges.medium;
  const PriorityIcon = priority.icon;
  const isTyping = typingUsers && typingUsers[card._id];

  // Overdue check: card has a dueDate that passed, and is not already done
  const isOverdue =
    Boolean(card.dueDate) &&
    new Date(card.dueDate).setHours(23, 59, 59, 999) < Date.now() &&
    card.status !== 'done';

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => {
        const cardContent = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
            }}
            className={`group relative rounded-[20px] p-4 mb-3.5 transition-all duration-200 select-none ${
              snapshot.isDragging
                ? 'clay-card-dragging rotate-2 scale-[1.02] z-50 pointer-events-auto shadow-[0_24px_45px_-8px_rgba(56,49,57,0.24)]'
                : `bg-white border ${
                    isOverdue
                      ? 'border-[#e8d8de] border-l-[4px] border-l-[#e11d48]'
                      : 'border-[#dcd8ea]'
                  } shadow-[0_4px_12px_-2px_rgba(56,49,57,0.07),0_2px_4px_-1px_rgba(56,49,57,0.03)] hover:shadow-[0_16px_32px_-6px_rgba(56,49,57,0.16),0_6px_14px_-2px_rgba(56,49,57,0.08)] hover:border-[#9683c3] hover:-translate-y-1.5`
            }`}
            onClick={() => {
              if (!snapshot.isDragging) {
                onCardClick(card);
              }
            }}
          >
            {/* Real-time typing/editing indicator */}
            {isTyping && (
              <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ded0f9] text-[#383139] shadow-[0_3px_8px_-2px_rgba(222,208,249,0.7),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(130,100,180,0.15)] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8264b4] animate-ping"></span>
                <span>{isTyping} is editing...</span>
              </div>
            )}

            {/* Top row: Priority & Quick Status Toggle */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priority.classes}`}
              >
                <PriorityIcon className="w-3 h-3 stroke-[2.5]" />
                <span>{priority.label}</span>
              </span>

              {/* Status Shift Buttons (recessed mini pods) */}
              <div
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {card.status !== 'todo' && (
                  <button
                    onClick={() => onStatusChange(card._id, 'todo')}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#f1f2fa] text-[#48404b] shadow-[0_2px_5px_-1px_rgba(56,49,57,0.1),inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(56,49,57,0.06)] hover:bg-[#ded0f9] active:scale-95 transition-all"
                    title="Move to To Do"
                  >
                    To Do
                  </button>
                )}
                {card.status !== 'in_progress' && (
                  <button
                    onClick={() => onStatusChange(card._id, 'in_progress')}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#f1f2fa] text-[#48404b] shadow-[0_2px_5px_-1px_rgba(56,49,57,0.1),inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(56,49,57,0.06)] hover:bg-[#f9e7a8] active:scale-95 transition-all"
                    title="Move to In Progress"
                  >
                    In Progress
                  </button>
                )}
                {card.status !== 'done' && (
                  <button
                    onClick={() => onStatusChange(card._id, 'done')}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#f1f2fa] text-[#48404b] shadow-[0_2px_5px_-1px_rgba(56,49,57,0.1),inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(56,49,57,0.06)] hover:bg-[#c0efdc] active:scale-95 transition-all"
                    title="Move to Done"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>

            {/* Card Title */}
            <h4 className="text-sm font-bold text-[#383139] leading-snug line-clamp-2 mb-1">
              {card.title}
            </h4>

            {/* Card Description */}
            {card.description && (
              <p className="text-xs text-[#48404b] line-clamp-2 mb-3 leading-relaxed">
                {card.description}
              </p>
            )}

            {/* Footer: Date & Assignee */}
            <div className="flex items-center justify-between text-[#48404b] pt-2.5 mt-2 border-t border-[#f0eef7] text-xs">
              <div className="flex items-center gap-1.5">
                {card.dueDate ? (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]'
                        : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]'
                    }`}
                  >
                    {isOverdue ? (
                      <AlertCircle className="w-3 h-3 text-[#dc2626]" />
                    ) : (
                      <Clock className="w-3 h-3 text-[#64748b]" />
                    )}
                    <span>
                      {new Date(card.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </span>
                ) : (
                  <span className="text-[11px] text-[#8e8a94] font-medium">
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
                  className="w-6 h-6 rounded-full ring-2 ring-white shadow-[0_2px_6px_-1px_rgba(56,49,57,0.15)] object-cover"
                />
              ) : (
                <span className="text-[11px] text-[#8e8a94] italic font-medium">Unassigned</span>
              )}
            </div>
          </div>
        );

        if (snapshot.isDragging) {
          return ReactDOM.createPortal(cardContent, document.body);
        }

        return cardContent;
      }}
    </Draggable>
  );
};
