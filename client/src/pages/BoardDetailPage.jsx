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
  Bell,
  Search,
  X,
  Filter,
  Plus,
} from 'lucide-react';

export const BoardDetailPage = () => {
  const { id: boardId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteNotification, setInviteNotification] = useState(null);

  // Search & Filter state for managing high-density columns
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

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

    socket.emit('join-board', { boardId, user });

    const handleCardCreated = ({ card }) => {
      setCards((prev) => {
        if (prev.some((c) => c._id === card._id)) return prev;
        return [...prev, card];
      });
    };

    const handleCardUpdated = ({ card }) => {
      setCards((prev) =>
        prev.map((c) => (c._id === card._id ? card : c))
      );
      setSelectedCard((current) => (current && current._id === card._id ? card : current));
    };

    const handleCardMoved = ({ card, toStatus, destinationIndex }) => {
      setCards((prev) => {
        const withoutCard = prev.filter((c) => c._id !== card._id);
        const targetColumnCards = withoutCard.filter((c) => c.status === toStatus);
        const otherColumnCards = withoutCard.filter((c) => c.status !== toStatus);

        targetColumnCards.splice(destinationIndex, 0, card);

        const reorderedTarget = targetColumnCards.map((c, idx) => ({
          ...c,
          status: toStatus,
          order: idx,
        }));

        return [...otherColumnCards, ...reorderedTarget];
      });
    };

    const handleCardDeleted = ({ cardId }) => {
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      setSelectedCard((current) => (current && current._id === cardId ? null : current));
    };

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

    const handleBoardMemberAdded = ({ board: updatedBoard }) => {
      setBoard(updatedBoard);
    };

    const handleBoardDeleted = ({ boardId: deletedId }) => {
      if (deletedId === boardId) {
        alert('This board has been removed by the owner.');
        navigate('/dashboard');
      }
    };

    const handleBoardInvited = ({ board: newBoard, invitedBy }) => {
      setInviteNotification({
        title: newBoard.title,
        invitedBy: invitedBy?.name || 'A team member',
        boardId: newBoard._id,
      });

      setTimeout(() => {
        setInviteNotification(null);
      }, 7000);
    };

    socket.on('card:created', handleCardCreated);
    socket.on('card:updated', handleCardUpdated);
    socket.on('card:moved', handleCardMoved);
    socket.on('card:deleted', handleCardDeleted);
    socket.on('card:typing', handleCardTyping);
    socket.on('board:member_added', handleBoardMemberAdded);
    socket.on('board:deleted', handleBoardDeleted);
    socket.on('board:invited', handleBoardInvited);

    return () => {
      socket.emit('leave-board', { boardId, user });
      socket.off('card:created', handleCardCreated);
      socket.off('card:updated', handleCardUpdated);
      socket.off('card:moved', handleCardMoved);
      socket.off('card:deleted', handleCardDeleted);
      socket.off('card:typing', handleCardTyping);
      socket.off('board:member_added', handleBoardMemberAdded);
      socket.off('board:deleted', handleBoardDeleted);
      socket.off('board:invited', handleBoardInvited);
    };
  }, [socket, boardId, user, navigate]);

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

    const destStatus = destination.droppableId;
    const destIndex = destination.index;
    const previousCards = [...cards];

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

    try {
      await api.patch(`/cards/${draggableId}/move`, {
        destinationStatus: destStatus,
        destinationIndex: destIndex,
      });
    } catch (err) {
      console.error('Failed to persist card move:', err);
      setCards(previousCards);
      alert('Failed to move card: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (cardId, newStatus) => {
    const previousCards = [...cards];
    const targetCard = cards.find((c) => c._id === cardId);
    if (!targetCard || targetCard.status === newStatus) return;

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

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      !searchQuery.trim() ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'all' || card.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const cardsByColumn = {
    todo: filteredCards.filter((c) => c.status === 'todo').sort((a, b) => a.order - b.order),
    in_progress: filteredCards.filter((c) => c.status === 'in_progress').sort((a, b) => a.order - b.order),
    done: filteredCards.filter((c) => c.status === 'done').sort((a, b) => a.order - b.order),
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f2fa] text-[#383139] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-18 h-18 rounded-full bg-[#fcd2df] shadow-[0_10px_25px_-5px_rgba(252,210,223,0.7),inset_2px_2px_4px_rgba(255,255,255,0.85)] flex items-center justify-center mb-5">
            <ShieldAlert className="w-9 h-9 text-[#8c2340]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#383139] mb-2 tracking-tight">
            {error.status === 403 ? 'Access Restricted' : 'Board Not Found'}
          </h2>
          <p className="text-sm font-medium text-[#48404b] max-w-md mb-6 leading-relaxed">
            {error.status === 403
              ? 'You are not authorized to view this private board. Only the owner and invited collaborators can access this workspace.'
              : error.message}
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-full clay-btn-pill clay-btn-pink text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f1f2fa] text-[#383139] flex flex-col font-sans">
      <Navbar
        onToggleActivity={() => setIsActivityOpen(!isActivityOpen)}
        hasActivityDrawer={true}
      />

      {/* Real-Time Live Invite Notification Toast */}
      {inviteNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 max-w-sm">
          <div className="p-4 rounded-[26px] bg-[#fffdf7] border-2 border-[#f6a3ca] shadow-[0_18px_40px_-10px_rgba(246,163,202,0.6),inset_2px_2px_4px_rgba(255,255,255,0.95)] flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f6a3ca] flex items-center justify-center text-[#383139] shrink-0 shadow-sm mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#383139]">New Workspace Invitation!</h4>
              <p className="text-xs text-[#48404b] mt-0.5">
                <span className="font-bold">{inviteNotification.invitedBy}</span> added you to{' '}
                <span className="font-bold text-[#c74c83]">"{inviteNotification.title}"</span>.
              </p>
              <Link
                to={`/board/${inviteNotification.boardId}`}
                className="inline-block mt-2 px-3.5 py-1 rounded-full bg-[#ded0f9] text-[#4b3378] text-[11px] font-bold shadow-sm hover:bg-[#d4c2f6] transition-colors"
              >
                Open Workspace →
              </Link>
            </div>
            <button
              onClick={() => setInviteNotification(null)}
              className="text-[#8e8a94] hover:text-[#383139] text-xs font-bold p-1"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#fffdf7] shadow-[0_10px_25px_-5px_rgba(56,49,57,0.08),inset_2px_2px_4px_rgba(255,255,255,0.95)] text-sm font-bold text-[#383139]">
            <Loader2 className="w-5 h-5 animate-spin text-[#c74c83]" />
            <span>Loading collaborative workspace...</span>
          </div>
        </div>
      ) : (
        <main className="flex-1 min-h-0 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-1.5 pb-2.5">
          {/* Board Header Shelf - Tightened Height & Clean Hierarchy */}
          <div className="rounded-[24px] bg-[#fffdf7] border border-white shadow-[0_8px_20px_-6px_rgba(56,49,57,0.06),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_4px_rgba(56,49,57,0.03)] px-4 py-2 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
            {/* Left: Back, Title & Task Count */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="w-8 h-8 rounded-full bg-[#f1f2fa] hover:bg-[#e4e6f4] text-[#383139] shadow-[0_2px_6px_-1px_rgba(56,49,57,0.08),inset_1.5px_1.5px_3px_rgba(255,255,255,0.95)] active:scale-95 transition-all flex items-center justify-center shrink-0"
                title="Back to Dashboard"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-[#383139] tracking-tight">
                    {board?.title}
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#edeaf7] text-[#48404b] shadow-[inset_1px_1px_2px_rgba(56,49,57,0.06)]">
                    {filteredCards.length} {filteredCards.length === 1 ? 'task' : 'tasks'}
                    {filteredCards.length !== cards.length && ` (of ${cards.length})`}
                  </span>
                </div>
                {board?.description && (
                  <p className="text-xs font-medium text-[#6e6878] truncate max-w-md sm:max-w-xl">
                    {board.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Quick Search, Priority Filter, Primary "+ New Task", Ghost Actions */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
              {/* Search input */}
              <div className="relative w-40 sm:w-48">
                <Search className="w-3.5 h-3.5 text-[#8e8a94] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cards..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-full clay-inset-well text-xs font-semibold placeholder:text-[#8e8a94] transition-all"
                  aria-label="Search cards"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e8a94] hover:text-[#383139] text-xs font-bold"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Priority filter */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-full clay-inset-well text-xs font-bold text-[#383139] cursor-pointer appearance-none pr-7"
                  title="Filter by priority"
                  aria-label="Filter tasks by priority"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">🔴 Urgent</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="low">⚪ Low</option>
                </select>
                <Filter className="w-3 h-3 text-[#8e8a94] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Primary "+ New Task" Action */}
              <button
                onClick={() => setAddingToColumn('todo')}
                className="px-3.5 py-1.5 rounded-full bg-[#f6a3ca] hover:bg-[#f490bd] text-[#383139] text-xs font-bold shadow-[0_4px_10px_-2px_rgba(246,163,202,0.6),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_2px_rgba(180,80,130,0.2)] active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                title="Create new task (adds to To Do)"
                aria-label="Create new task"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Task</span>
              </button>

              {/* Secondary / Ghost Collaborators Button */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 rounded-full border border-[#dedae8] bg-white/70 hover:bg-white text-[#48404b] hover:text-[#383139] text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                title="Manage board collaborators"
                aria-label={`Collaborators (${board?.members?.length || 1})`}
              >
                <UserPlus className="w-3.5 h-3.5 text-[#5e546e]" />
                <span>Collaborators ({board?.members?.length || 1})</span>
              </button>

              {/* Secondary / Ghost Activity Button */}
              <button
                onClick={() => setIsActivityOpen(true)}
                className="px-3 py-1.5 rounded-full border border-[#dedae8] bg-white/70 hover:bg-white text-[#48404b] hover:text-[#383139] text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                title="View board activity log"
                aria-label="View board activity log"
              >
                <History className="w-3.5 h-3.5 text-[#5e546e]" />
                <span>Activity</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns with Drag and Drop - Single scroll strategy */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 min-h-0 flex gap-5 overflow-x-auto pb-1 items-stretch board-scroll">
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
