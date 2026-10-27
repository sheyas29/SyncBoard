import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { Navbar } from '../components/Navbar.jsx';
import { Column } from '../components/Board/Column.jsx';
import { CardModal } from '../components/Board/CardModal.jsx';
import { AddCardModal } from '../components/Board/AddCardModal.jsx';
import { ShareBoardModal } from '../components/Board/ShareBoardModal.jsx';
import { ActivityDrawer } from '../components/Board/ActivityDrawer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import api from '../api/client.js';
import {
  ArrowLeft,
  UserPlus,
  History,
  ShieldAlert,
  Loader2,
  Filter,
} from 'lucide-react';

const COLUMN_KEYS = ['todo', 'in_progress', 'done'];

export const BoardDetailPage = () => {
  const { id: boardId } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedCard, setSelectedCard] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Live typing trackers: { [cardId]: userName }
  const [typingUsers, setTypingUsers] = useState({});

  // Fetch initial board and card data
  const loadBoardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/boards/${boardId}`);
      if (res.data.success) {
        setBoard(res.data.data.board);
        setCards(res.data.data.cards || []);
      }
    } catch (err) {
      console.error('Error loading board:', err);
      const status = err.response?.status;
      const message =
        err.response?.data?.message || 'Failed to load board details';
      setError({ status, message });
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Socket.IO Room management and Real-Time Listeners
  useEffect(() => {
    if (!socket || !boardId || !user) return;

    // Join board room
    socket.emit('join-board', { boardId, user });

    // Handle real-time card created
    const handleCardCreated = ({ card, actor }) => {
      setCards((prev) => {
        // Prevent duplicate insertion if current user created it
        if (prev.some((c) => c._id === card._id)) return prev;
        return [...prev, card];
      });
    };

    // Handle real-time card updated
    const handleCardUpdated = ({ card }) => {
      setCards((prev) =>
        prev.map((c) => (c._id === card._id ? card : c))
      );
      // Also update open modal card if active
      setSelectedCard((current) => (current && current._id === card._id ? card : current));
    };

    // Handle real-time card moved
    const handleCardMoved = ({ card, fromStatus, toStatus, destinationIndex }) => {
      setCards((prev) => {
        const withoutCard = prev.filter((c) => c._id !== card._id);
        const targetColumnCards = withoutCard.filter((c) => c.status === toStatus);
        const otherColumnCards = withoutCard.filter((c) => c.status !== toStatus);

        targetColumnCards.splice(destinationIndex, 0, card);

        // Update orders
        const reorderedTarget = targetColumnCards.map((c, idx) => ({
          ...c,
          status: toStatus,
          order: idx,
        }));

        return [...otherColumnCards, ...reorderedTarget];
      });
    };

    // Handle real-time card deleted
    const handleCardDeleted = ({ cardId }) => {
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      setSelectedCard((current) => (current && current._id === cardId ? null : current));
    };

    // Handle live typing
    const handleCardTyping = ({ cardId, userName, isTyping }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) {
          next[cardId] = userName;
        } else {
          delete next[cardId];
        }
        return next;
      });
    };

    socket.on('card:created', handleCardCreated);
    socket.on('card:updated', handleCardUpdated);
    socket.on('card:moved', handleCardMoved);
    socket.on('card:deleted', handleCardDeleted);
    socket.on('card:typing', handleCardTyping);

    return () => {
      socket.emit('leave-board', { boardId, user });
      socket.off('card:created', handleCardCreated);
      socket.off('card:updated', handleCardUpdated);
      socket.off('card:moved', handleCardMoved);
      socket.off('card:deleted', handleCardDeleted);
      socket.off('card:typing', handleCardTyping);
    };
  }, [socket, boardId, user]);

  // Drag and Drop Handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const destIndex = destination.index;

    // Snapshot previous cards for rollback if error
    const previousCards = [...cards];

    // Optimistic local state update
    const movingCard = cards.find((c) => c._id === draggableId);
    if (!movingCard) return;

    const cardsWithoutMoving = cards.filter((c) => c._id !== draggableId);
    const destColumnCards = cardsWithoutMoving.filter((c) => c.status === destStatus);
    const otherCards = cardsWithoutMoving.filter((c) => c.status !== destStatus);

    const updatedMovingCard = { ...movingCard, status: destStatus, order: destIndex };
    destColumnCards.splice(destIndex, 0, updatedMovingCard);

    const reorderedDestCards = destColumnCards.map((c, idx) => ({
      ...c,
      status: destStatus,
      order: idx,
    }));

    setCards([...otherCards, ...reorderedDestCards]);

    // Send update to server
    try {
      await api.patch(`/cards/${draggableId}/move`, {
        destinationStatus: destStatus,
        destinationIndex: destIndex,
      });
    } catch (err) {
      console.error('Failed to persist card move:', err);
      // Rollback to previous state
      setCards(previousCards);
      alert('Failed to move card: ' + (err.response?.data?.message || err.message));
    }
  };

  // Status Change via button (Accessibility / alternative to drag)
  const handleStatusChange = async (cardId, newStatus) => {
    const previousCards = [...cards];
    const targetCard = cards.find((c) => c._id === cardId);
    if (!targetCard || targetCard.status === newStatus) return;

    // Optimistically update
    setCards((prev) =>
      prev.map((c) => (c._id === cardId ? { ...c, status: newStatus } : c))
    );

    try {
      await api.patch(`/cards/${cardId}/move`, {
        destinationStatus: newStatus,
        destinationIndex: 0,
      });
    } catch (err) {
      setCards(previousCards);
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Card CRUD Operations
  const handleCreateCard = async (cardData) => {
    const res = await api.post('/cards', cardData);
    if (res.data.success) {
      setCards((prev) => {
        if (prev.some((c) => c._id === res.data.data._id)) return prev;
        return [...prev, res.data.data];
      });
    }
    return res.data;
  };

  const handleUpdateCard = async (cardId, updatedFields) => {
    const res = await api.put(`/cards/${cardId}`, updatedFields);
    if (res.data.success) {
      setCards((prev) =>
        prev.map((c) => (c._id === cardId ? res.data.data : c))
      );
    }
    return res.data;
  };

  const handleDeleteCard = async (cardId) => {
    await api.delete(`/cards/${cardId}`);
    setCards((prev) => prev.filter((c) => c._id !== cardId));
  };

  // Group cards by column
  const cardsByColumn = {
    todo: cards.filter((c) => c.status === 'todo').sort((a, b) => a.order - b.order),
    in_progress: cards.filter((c) => c.status === 'in_progress').sort((a, b) => a.order - b.order),
    done: cards.filter((c) => c.status === 'done').sort((a, b) => a.order - b.order),
  };

  // Render Access Denied / Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error.status === 403 ? 'Access Restricted' : 'Board Not Found'}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {error.status === 403
              ? 'You are not authorized to view this private board. Only the owner and invited collaborators can access this workspace.'
              : error.message}
          </p>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        currentBoardTitle={board?.title}
        onToggleActivity={() => setIsActivityOpen(!isActivityOpen)}
        hasActivityDrawer={true}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-indigo-400 text-sm font-medium">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading collaborative workspace...</span>
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Board Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {board?.title}
                </h1>
              </div>
              {board?.description && (
                <p className="text-xs text-slate-400 mt-1 pl-10 max-w-2xl">
                  {board.description}
                </p>
              )}
            </div>

            {/* Actions: Collaborators & Activity */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Collaborators ({board?.members?.length || 1})</span>
              </button>

              <button
                onClick={() => setIsActivityOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>Activity Log</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns with Drag and Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-6 overflow-x-auto pb-6 items-start">
              <Column
                columnId="todo"
                title="To Do"
                cards={cardsByColumn.todo}
                onAddCardClick={(colId) => setAddingToColumn(colId)}
                onCardClick={(card) => setSelectedCard(card)}
                onStatusChange={handleStatusChange}
                onDeleteCard={handleDeleteCard}
                typingUsers={typingUsers}
              />

              <Column
                columnId="in_progress"
                title="In Progress"
                cards={cardsByColumn.in_progress}
                onAddCardClick={(colId) => setAddingToColumn(colId)}
                onCardClick={(card) => setSelectedCard(card)}
                onStatusChange={handleStatusChange}
                onDeleteCard={handleDeleteCard}
                typingUsers={typingUsers}
              />

              <Column
                columnId="done"
                title="Done"
                cards={cardsByColumn.done}
                onAddCardClick={(colId) => setAddingToColumn(colId)}
                onCardClick={(card) => setSelectedCard(card)}
                onStatusChange={handleStatusChange}
                onDeleteCard={handleDeleteCard}
                typingUsers={typingUsers}
              />
            </div>
          </DragDropContext>
        </main>
      )}

      {/* Modals */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={boardId}
          members={board?.members || []}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {addingToColumn && (
        <AddCardModal
          columnId={addingToColumn}
          boardId={boardId}
          members={board?.members || []}
          onClose={() => setAddingToColumn(null)}
          onCreateCard={handleCreateCard}
        />
      )}

      {isShareModalOpen && board && (
        <ShareBoardModal
          board={board}
          onClose={() => setIsShareModalOpen(false)}
          onMemberAdded={(updatedBoard) => setBoard(updatedBoard)}
        />
      )}

      <ActivityDrawer
        boardId={boardId}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />
    </div>
  );
};
