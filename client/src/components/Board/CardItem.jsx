import React from 'react';
import ReactDOM from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import {
  Clock,
  ChevronsUp,
  ChevronUp,
  Minus,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const priorityBadges = {
  urgent: {
    label: 'Urgent',
    icon: ChevronsUp,
    classes: 'bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5] shadow-[0_2px_6px_-1px_rgba(239,68,68,0.18)]',
  },
  high: {
    label: 'High',
    icon: ChevronUp,
    classes: 'bg-[#fff7ed] text-[#9a3412] border border-[#fdba74] shadow-[0_2px_6px_-1px_rgba(249,115,22,0.18)]',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    classes: 'bg-[#eff6ff] text-[#1e40af] border border-[#93c5fd] shadow-[0_2px_6px_-1px_rgba(59,130,246,0.18)]',
  },
  low: {
    label: 'Low',
    icon: ChevronDown,
    classes: 'bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] shadow-[0_2px_6px_-1px_rgba(100,116,139,0.15)]',
  },
};

/**
 * Display helper for due dates.
 * Computes calendar-date diffs safely in local time.
 * Returns { label, classes, isOverdue }
 * All text colors meet WCAG AA (>= 4.5:1) on their backgrounds.
 */
const getDueDateDisplay = (dueDateStr, isDone) => {
  if (!dueDateStr) return null;

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) return null;

  const formattedDate = dueDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });

  // Done column: neutral/muted, no urgency styling (WCAG AA: #52525b on #f4f4f5 = 6.2:1)
  if (isDone) {
    return {
      label: formattedDate,
      classes: 'bg-[#f4f4f5] text-[#52525b] border border-[#d4d4d8]',
      isOverdue: false,
    };
  }

  // Compare local calendar dates (normalized to local midnight)
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Overdue (not done) - WCAG AA: #991b1b on #fef2f2 = 7.5:1
    return {
      label: `Overdue · ${formattedDate}`,
      classes: 'bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5] shadow-[0_1px_3px_rgba(239,68,68,0.12)]',
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    // Today: amber - WCAG AA: #92400e on #fffbeb = 7.1:1
    return {
      label: 'Today',
      classes: 'bg-[#fffbeb] text-[#92400e] border border-[#fcd34d]',
      isOverdue: false,
    };
  }

  if (diffDays === 1) {
    // Tomorrow: amber - WCAG AA: #92400e on #fffbeb = 7.1:1
    return {
      label: 'Tomorrow',
      classes: 'bg-[#fffbeb] text-[#92400e] border border-[#fcd34d]',
      isOverdue: false,
    };
  }

  // Later: neutral with formatted date - WCAG AA: #334155 on #f8fafc = 7.2:1
  return {
    label: formattedDate,
    classes: 'bg-[#f8fafc] text-[#334155] border border-[#cbd5e1]',
    isOverdue: false,
  };
};

export const CardItem = ({
  card,
  index,
  onCardClick,
  onStatusChange,
  onDeleteCard,
  typingUsers,
}) => {
  const isDone = card.status === 'done';
  const priority = priorityBadges[card.priority] || priorityBadges.medium;
  const PriorityIcon = priority.icon;
  const isTyping = typingUsers && typingUsers[card._id];

  const dueInfo = getDueDateDisplay(card.dueDate, isDone);
  const isOverdue = Boolean(dueInfo?.isOverdue);

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
            className={`group relative rounded-[20px] p-4 mb-3.5 transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8264b4] ${
              snapshot.isDragging
                ? 'clay-card-dragging rotate-2 scale-[1.02] z-50 pointer-events-auto shadow-[0_24px_45px_-8px_rgba(56,49,57,0.24)]'
                : `${isDone ? 'opacity-70 hover:opacity-100 bg-[#faf9fc]' : 'bg-white'} border ${
                    isOverdue
                      ? 'border-[#e8d8de] border-l-[4px] border-l-[#e11d48]'
                      : 'border-[#dcd8ea]'
                  } shadow-[0_4px_12px_-2px_rgba(56,49,57,0.07),0_2px_4px_-1px_rgba(56,49,57,0.03)] hover:shadow-[0_16px_32px_-6px_rgba(56,49,57,0.16),0_6px_14px_-2px_rgba(56,49,57,0.08)] hover:border-[#9683c3] hover:-translate-y-1.5`
            }`}
            role="button"
            tabIndex={0}
            aria-label={`Task: ${card.title}. Priority ${priority.label}${
              dueInfo ? `, Due ${dueInfo.label}` : ''
            }. Status: ${card.status.replace('_', ' ')}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCardClick(card);
              }
            }}
            onClick={() => {
              if (!snapshot.isDragging) {
                onCardClick(card);
              }
            }}
          >
            {/* Real-time typing/editing indicator */}
            {isTyping && (
              <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ded0f9] text-[#2b1b46] shadow-[0_3px_8px_-2px_rgba(222,208,249,0.7),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(130,100,180,0.15)] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8264b4] animate-ping"></span>
                <span>{isTyping} is editing...</span>
              </div>
            )}

            {/* Top row: Priority & Quick Status Toggle */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isDone
                    ? 'bg-[#f4f4f5] text-[#52525b] border border-[#d4d4d8]'
                    : priority.classes
                }`}
              >
                <PriorityIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{priority.label}</span>
              </span>

              {/* Status Shift Buttons (recessed mini pods) - Keyboard reachable and visible on focus */}
              <div
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {card.status !== 'todo' && (
                  <button
                    onClick={() => onStatusChange(card._id, 'todo')}
                    className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#f1f2fa] text-[#383139] border border-[#e4e2ed] shadow-[0_2px_5px_-1px_rgba(56,49,57,0.1)] hover:bg-[#ded0f9] active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8264b4]"
                    title="Move to To Do"
                    aria-label={`Move task "${card.title}" to To Do`}
                  >
                    To Do
                  </button>
                )}
                {card.status !== 'in_progress' && (
                  <button
                    onClick={() => onStatusChange(card._id, 'in_progress')}
                    className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#f1f2fa] text-[#383139] border border-[#e4e2ed] shadow-[0_2px_5px_-1px_rgba(56,49,57,0.1)] hover:bg-[#f9e7a8] active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8264b4]"
                    title="Move to In Progress"
                    aria-label={`Move task "${card.title}" to In Progress`}
                  >
                    In Progress
                  </button>
                )}
                {card.status !== 'done' && (
                  <button
                    onClick={() => onStatusChange(card._id, 'done')}
                    className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#f1f2fa] text-[#383139] border border-[#e4e2ed] shadow-[0_2px_5px_-1px_rgba(56,49,57,0.1)] hover:bg-[#c0efdc] active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8264b4]"
                    title="Move to Done"
                    aria-label={`Move task "${card.title}" to Done`}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>

            {/* Card Title (Strikethrough & small check icon when Done) */}
            <div className="flex items-start gap-1.5 mb-1">
              {isDone && (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
              )}
              <h4
                className={`text-sm font-bold leading-snug line-clamp-2 ${
                  isDone ? 'line-through text-[#52525b]' : 'text-[#383139]'
                }`}
              >
                {card.title}
              </h4>
            </div>

            {/* Card Description */}
            {card.description && (
              <p
                className={`text-xs line-clamp-2 mb-3 leading-relaxed ${
                  isDone ? 'text-[#58515f]' : 'text-[#48404b]'
                }`}
              >
                {card.description}
              </p>
            )}

            {/* Footer: Date & Assignee */}
            <div className="flex items-center justify-between text-[#48404b] pt-2.5 mt-2 border-t border-[#f0eef7] text-xs">
              <div className="flex items-center gap-1.5">
                {dueInfo ? (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${dueInfo.classes}`}
                  >
                    {dueInfo.isOverdue ? (
                      <AlertCircle className="w-3.5 h-3.5 text-[#991b1b] shrink-0" />
                    ) : isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#52525b] shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{dueInfo.label}</span>
                  </span>
                ) : (
                  <span className="text-xs text-[#58515f] font-medium">
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
                <span className="text-xs text-[#58515f] italic font-medium">Unassigned</span>
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
