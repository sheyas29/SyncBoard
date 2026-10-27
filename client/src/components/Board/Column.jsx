import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CardItem } from './CardItem.jsx';
import { Plus, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';

const columnStyles = {
  todo: {
    accent: 'bg-indigo-500',
    icon: ListTodo,
    headerBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    title: 'To Do',
  },
  in_progress: {
    accent: 'bg-amber-500',
    icon: Loader2,
    headerBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    title: 'In Progress',
  },
  done: {
    accent: 'bg-emerald-500',
    icon: CheckCircle2,
    headerBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    title: 'Done',
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
  const style = columnStyles[columnId] || columnStyles.todo;
  const IconComponent = style.icon;

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-sm rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${style.headerBg}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-100 tracking-wide">
            {title || style.title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddCardClick(columnId)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Card List */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 flex flex-col min-h-[420px] transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20' : ''
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
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500 font-medium">No cards yet</p>
                <button
                  onClick={() => onAddCardClick(columnId)}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add a card
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
