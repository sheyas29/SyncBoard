import Card from '../models/Card.js';
import Board from '../models/Board.js';
import Activity from '../models/Activity.js';
import { checkBoardAuthorization } from './boardController.js';

// Helper to broadcast socket event to the board's room
const emitBoardEvent = (req, eventName, payload) => {
  const io = req.app.get('io');
  if (io && payload.boardId) {
    io.to(payload.boardId.toString()).emit(eventName, payload);
  }
};

// @desc    Create a new card on a board
// @route   POST /api/cards
// @access  Private
export const createCard = async (req, res, next) => {
  try {
    const { boardId, title, description, status, priority, assignee, dueDate } = req.body;

    if (!boardId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Board ID and Card Title are required',
      });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    if (!checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to add cards to this board',
      });
    }

    const targetStatus = status || 'todo';

    // Get current maximum order in this column to place new card at the bottom
    const lastCard = await Card.findOne({ board: boardId, status: targetStatus })
      .sort({ order: -1 })
      .select('order');

    const nextOrder = lastCard ? lastCard.order + 1 : 0;

    const card = await Card.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: targetStatus,
      priority: priority || 'medium',
      board: boardId,
      assignee: assignee || null,
      dueDate: dueDate || null,
      order: nextOrder,
      createdBy: req.user._id,
    });

    const populatedCard = await Card.findById(card._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Record activity
    await Activity.create({
      board: boardId,
      user: req.user._id,
      action: 'CARD_CREATED',
      details: { cardTitle: populatedCard.title, status: populatedCard.status },
    });

    // Real-time broadcast
    emitBoardEvent(req, 'card:created', {
      boardId,
      card: populatedCard,
      actor: { _id: req.user._id, name: req.user.name },
    });

    res.status(201).json({
      success: true,
      data: populatedCard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update card details (title, description, priority, assignee, dueDate)
// @route   PUT /api/cards/:id
// @access  Private
export const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    if (!board || !checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { title, description, priority, assignee, dueDate, labels } = req.body;

    if (title) card.title = title.trim();
    if (description !== undefined) card.description = description.trim();
    if (priority) card.priority = priority;
    if (assignee !== undefined) card.assignee = assignee ? assignee : null;
    if (dueDate !== undefined) card.dueDate = dueDate ? new Date(dueDate) : null;
    if (labels !== undefined) card.labels = labels;

    await card.save();

    const populatedCard = await Card.findById(card._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Record activity
    await Activity.create({
      board: card.board,
      user: req.user._id,
      action: 'CARD_UPDATED',
      details: { cardTitle: populatedCard.title },
    });

    // Real-time broadcast
    emitBoardEvent(req, 'card:updated', {
      boardId: card.board,
      card: populatedCard,
      actor: { _id: req.user._id, name: req.user.name },
    });

    res.status(200).json({
      success: true,
      data: populatedCard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move / reorder card across columns or within a column
// @route   PATCH /api/cards/:id/move
// @access  Private
export const moveCard = async (req, res, next) => {
  try {
    const { destinationStatus, destinationIndex } = req.body;

    if (!destinationStatus) {
      return res.status(400).json({
        success: false,
        message: 'Destination status is required',
      });
    }

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    if (!board || !checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const originalStatus = card.status;
    const originalOrder = card.order;
    const newIndex = typeof destinationIndex === 'number' ? destinationIndex : 0;

    // Moving to a different column or reordering in the same column
    if (originalStatus === destinationStatus) {
      // Reordering within the same column
      const cardsInColumn = await Card.find({
        board: card.board,
        status: originalStatus,
      }).sort({ order: 1 });

      const filtered = cardsInColumn.filter((c) => c._id.toString() !== card._id.toString());
      filtered.splice(newIndex, 0, card);

      // Re-index all cards in this column
      const bulkOps = filtered.map((c, index) => ({
        updateOne: {
          filter: { _id: c._id },
          update: { $set: { order: index } },
        },
      }));

      if (bulkOps.length > 0) {
        await Card.bulkWrite(bulkOps);
      }
    } else {
      // Moving to a new column
      // 1. Shift remaining cards in original column down
      await Card.updateMany(
        { board: card.board, status: originalStatus, order: { $gt: originalOrder } },
        { $inc: { order: -1 } }
      );

      // 2. Fetch cards in target column and insert at newIndex
      const targetColumnCards = await Card.find({
        board: card.board,
        status: destinationStatus,
      }).sort({ order: 1 });

      targetColumnCards.splice(newIndex, 0, card);

      const bulkOps = targetColumnCards.map((c, index) => ({
        updateOne: {
          filter: { _id: c._id },
          update: { $set: { status: destinationStatus, order: index } },
        },
      }));

      if (bulkOps.length > 0) {
        await Card.bulkWrite(bulkOps);
      }

      await Activity.create({
        board: card.board,
        user: req.user._id,
        action: 'CARD_MOVED',
        details: {
          cardTitle: card.title,
          fromStatus: originalStatus,
          toStatus: destinationStatus,
        },
      });
    }

    const updatedCard = await Card.findById(card._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Real-time broadcast
    emitBoardEvent(req, 'card:moved', {
      boardId: card.board,
      card: updatedCard,
      fromStatus: originalStatus,
      toStatus: destinationStatus,
      destinationIndex: newIndex,
      actor: { _id: req.user._id, name: req.user.name },
    });

    res.status(200).json({
      success: true,
      data: updatedCard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private
export const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    if (!board || !checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const boardId = card.board;
    const cardTitle = card.title;
    const cardStatus = card.status;
    const cardOrder = card.order;

    await Card.findByIdAndDelete(card._id);

    // Reorder subsequent cards in that column
    await Card.updateMany(
      { board: boardId, status: cardStatus, order: { $gt: cardOrder } },
      { $inc: { order: -1 } }
    );

    await Activity.create({
      board: boardId,
      user: req.user._id,
      action: 'CARD_DELETED',
      details: { cardTitle },
    });

    // Real-time broadcast
    emitBoardEvent(req, 'card:deleted', {
      boardId,
      cardId: card._id,
      status: cardStatus,
      actor: { _id: req.user._id, name: req.user.name },
    });

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
      cardId: card._id,
    });
  } catch (error) {
    next(error);
  }
};
