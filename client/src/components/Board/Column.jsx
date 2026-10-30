import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CardItem } from './CardItem.jsx';
import { Plus, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';

const columnThemes = {
  todo: {
    title: 'To Do',
    icon: ListTodo,
    trayBg: 'bg-[#ded0f9]', // Pastel Lavender
    headerShadow: 'shadow-[0_8px_16px_-4px_rgba(222,208,249,0.7),inset_2px_2px_4px_rgba(255,255,255,0.85),inset_-2px_-2px_4px_rgba(130,100,180,0.2)]',
    podBg: 'bg-[#f0eafc] text-[#383139]',
    iconColor: 'text-[#5b3b9b]',
    columnBg: 'bg-[#f7f5fd]',
    columnBorder: 'border-[#e4def2]',
    wellBg: 'bg-[#efeaf9]/75',
    wellBorder: 'border-[#ded6f0]',
  },
  in_progress: {
    title: 'In Progress',
    icon: Loader2,
    trayBg: 'bg-[#f9e7a8]', // Pastel Butter-Yellow
    headerShadow: 'shadow-[0_8px_16px_-4px_rgba(249,231,168,0.7),inset_2px_2px_4px_rgba(255,255,255,0.85),inset_-2px_-2px_4px_rgba(180,150,60,0.2)]',
    podBg: 'bg-[#fcf5d2] text-[#383139]',
    iconColor: 'text-[#876a16]',
    columnBg: 'bg-[#fdfbf2]',
    columnBorder: 'border-[#f2ebd2]',
    wellBg: 'bg-[#faf3dc]/75',
    wellBorder: 'border-[#eee3bd]',
  },
  done: {
    title: 'Done',
    icon: CheckCircle2,
    trayBg: 'bg-[#c0efdc]', // Pastel Mint
    headerShadow: 'shadow-[0_8px_16px_-4px_rgba(192,239,220,0.7),inset_2px_2px_4px_rgba(255,255,255,0.85),inset_-2px_-2px_4px_rgba(90,160,130,0.2)]',
    podBg: 'bg-[#e4f8f0] text-[#383139]',
    iconColor: 'text-[#1d6b49]',
    columnBg: 'bg-[#f2faf6]',
    columnBorder: 'border-[#d4ede2]',
    wellBg: 'bg-[#def3ea]/75',
    wellBorder: 'border-[#cae8db]',
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
      className={`flex flex-col flex-1 min-w-[310px] max-w-sm rounded-[34px] ${theme.columnBg} border ${theme.columnBorder} shadow-[0_14px_32px_-10px_rgba(56,49,57,0.07),inset_2.5px_2.5px_5px_rgba(255,255,255,0.95),inset_-2.5px_-2.5px_6px_rgba(56,49,57,0.03)] overflow-hidden`}
    >
      {/* Column Header Cushion */}
      <div className="p-3.5 pb-2">
        <div
          className={`px-4 py-3 rounded-[24px] ${theme.trayBg} ${theme.headerShadow} flex items-center justify-between transition-all`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-white/70 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(56,49,57,0.1)]">
              <IconComponent className={`w-4 h-4 ${theme.iconColor}`} />
            </div>
            <h3 className="font-bold text-sm text-[#383139] tracking-tight">
              {title || theme.title}
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${theme.podBg} shadow-[inset_1px_1px_2px_rgba(56,49,57,0.08),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]`}
            >
              {cards.length}
            </span>
          </div>

          <button
            onClick={() => onAddCardClick(columnId)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#383139] shadow-[0_4px_10px_-2px_rgba(56,49,57,0.1),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95),inset_-1.5px_-1.5px_3px_rgba(56,49,57,0.08)] active:scale-95 transition-all flex items-center justify-center"
            title={`Add card to ${title}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Droppable Card List Recessed Tray */}
      <div className="p-3 pt-1 flex-1 flex flex-col">
        <Droppable droppableId={columnId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3 flex-1 flex flex-col min-h-[460px] rounded-[26px] border ${theme.wellBorder} ${theme.wellBg} shadow-[inset_1.5px_1.5px_4px_rgba(56,49,57,0.05),inset_-1.5px_-1.5px_4px_rgba(255,255,255,0.9)] transition-all duration-200 ${
                snapshot.isDraggingOver
                  ? 'bg-white/70 ring-2 ring-[#c0b3df] shadow-[inset_2px_2px_6px_rgba(56,49,57,0.09)]'
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
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#d8d2e8] bg-white/40 rounded-[22px] text-center my-2">
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
