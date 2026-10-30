import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CardItem } from './CardItem.jsx';
import { Plus, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';

const columnThemes = {
  todo: {
    title: 'To Do',
    icon: ListTodo,
    headerBg: 'bg-[#eeedf5]', // Calm neutral lavender-slate tint
    headerBorder: 'border-[#dfdbe8]',
    headerShadow: 'shadow-[0_4px_12px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.04)]',
    podBg: 'bg-white/90 text-[#3d3748]',
    iconColor: 'text-[#5d5671]',
  },
  in_progress: {
    title: 'In Progress',
    icon: Loader2,
    headerBg: 'bg-[#f7f2e8]', // Calm neutral warm tint
    headerBorder: 'border-[#ede2cf]',
    headerShadow: 'shadow-[0_4px_12px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.04)]',
    podBg: 'bg-white/90 text-[#4c402b]',
    iconColor: 'text-[#7d6942]',
  },
  done: {
    title: 'Done',
    icon: CheckCircle2,
    headerBg: 'bg-[#eaf4ef]', // Calm neutral mint-sage tint
    headerBorder: 'border-[#d2e7dc]',
    headerShadow: 'shadow-[0_4px_12px_-2px_rgba(56,49,57,0.06),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.04)]',
    podBg: 'bg-white/90 text-[#294535]',
    iconColor: 'text-[#356d50]',
  },
};

export const Column = ({
  columnId,
  title,
  cards,
  onAddCardClick,
  onCardClick,
  onStatusChange,
  onDeleteCard,
  typingUsers,
}) => {
  const theme = columnThemes[columnId] || columnThemes.todo;
  const IconComponent = theme.icon;

  return (
    <div
      className="flex flex-col flex-1 min-w-[310px] max-w-sm rounded-[34px] bg-[#f5f4f9] border border-[#e3e1eb] shadow-[0_12px_28px_-10px_rgba(56,49,57,0.06),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_5px_rgba(56,49,57,0.03)] overflow-hidden h-full min-h-[520px] max-h-full"
    >
      {/* Column Header Cushion - Fixed at top with subtle tint only */}
      <div className="p-3.5 pb-2 shrink-0">
        <div
          className={`px-4 py-3 rounded-[24px] ${theme.headerBg} border ${theme.headerBorder} ${theme.headerShadow} flex items-center justify-between transition-all`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-white/80 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(56,49,57,0.08)]">
              <IconComponent className={`w-4 h-4 ${theme.iconColor}`} />
            </div>
            <h3 className="font-bold text-sm text-[#383139] tracking-tight">
              {title || theme.title}
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${theme.podBg} shadow-[inset_1px_1px_2px_rgba(56,49,57,0.06),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]`}
            >
              {cards.length}
            </span>
          </div>

          <button
            onClick={() => onAddCardClick(columnId)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#383139] shadow-[0_3px_8px_-2px_rgba(56,49,57,0.1),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.06)] active:scale-95 transition-all flex items-center justify-center"
            title={`Add card to ${title}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Droppable Card List Calm Neutral Recessed Tray */}
      <div className="p-3 pt-1 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Droppable droppableId={columnId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3 flex-1 min-h-0 flex flex-col rounded-[26px] border border-[#dedae7] bg-[#ece9f3]/65 shadow-[inset_1.5px_1.5px_4px_rgba(56,49,57,0.04),inset_-1.5px_-1.5px_4px_rgba(255,255,255,0.85)] column-card-scroll transition-all duration-200 ${
                snapshot.isDraggingOver
                  ? 'bg-white/80 ring-2 ring-[#b8a9d8] shadow-[inset_2px_2px_6px_rgba(56,49,57,0.09)]'
                  : ''
              }`}
            >
              {cards.map((card, index) => (
                <CardItem
                  key={card._id}
                  card={card}
                  index={index}
                  onCardClick={onCardClick}
                  onStatusChange={onStatusChange}
                  onDeleteCard={onDeleteCard}
                  typingUsers={typingUsers}
                />
              ))}
              {provided.placeholder}

              {/* Empty State */}
              {cards.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#d8d2e8] bg-white/40 rounded-[22px] text-center my-auto py-10">
                  <p className="text-xs text-[#6e6878] font-semibold">No tasks in this tray</p>
                  <button
                    onClick={() => onAddCardClick(columnId)}
                    className="mt-2.5 px-3.5 py-1.5 rounded-full bg-[#f6a3ca] hover:bg-[#f490bd] text-[#383139] text-xs font-bold shadow-[0_4px_10px_-2px_rgba(246,163,202,0.5),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_2px_rgba(180,80,130,0.2)] active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
