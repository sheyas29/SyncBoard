import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CardItem } from './CardItem.jsx';
import { Plus, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';

const columnThemes = {
  todo: {
    title: 'To Do',
    icon: ListTodo,
    iconBg: 'bg-[#ded0f9]/60',
    iconColor: 'text-[#5b3b9b]',
  },
  in_progress: {
    title: 'In Progress',
    icon: Loader2,
    iconBg: 'bg-[#f9e7a8]/60',
    iconColor: 'text-[#876a16]',
  },
  done: {
    title: 'Done',
    icon: CheckCircle2,
    iconBg: 'bg-[#c0efdc]/60',
    iconColor: 'text-[#1d6b49]',
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
      className="flex flex-col flex-1 min-w-[330px] max-w-[430px] rounded-[24px] bg-[#f5f4f9] border border-[#e3e1eb] shadow-[0_8px_24px_-8px_rgba(56,49,57,0.06)] overflow-hidden h-full"
    >
      {/* Sticky Column Header - Seamlessly integrated top bar */}
      <div className="sticky top-0 z-10 px-4 py-2.5 bg-[#f5f4f9]/95 backdrop-blur-md border-b border-[#e4e2ed] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${theme.iconBg} ${theme.iconColor}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#383139] tracking-tight">
            {title || theme.title}
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#48404b] border border-[#e2dfec] shadow-sm">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddCardClick(columnId)}
          className="w-7 h-7 rounded-full bg-white hover:bg-[#f7f6fc] text-[#383139] border border-[#dedae8] shadow-sm active:scale-95 transition-all flex items-center justify-center"
          title={`Add card to ${title}`}
          aria-label={`Add card to ${title}`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Flattened Direct Card Track - Cards have full width */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 min-h-0 flex flex-col column-card-scroll transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-[#ece9f4]/60' : ''
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
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#ded9ec] bg-white/40 rounded-[20px] text-center my-auto py-10">
                <p className="text-xs text-[#6e6878] font-semibold">No tasks in this column</p>
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
  );
};
