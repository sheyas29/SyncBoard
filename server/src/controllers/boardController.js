import Board from '../models/Board.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// Helper to check if a user is an authorized member or owner
export const checkBoardAuthorization = (board, userId) => {
  const userIdStr = userId.toString();
  const isOwner = board.owner.toString() === userIdStr;
  const isMember = board.members.some(
    (m) => m.user.toString() === userIdStr || (m.user._id && m.user._id.toString() === userIdStr)
  );
  return isOwner || isMember;
};

// @desc    Get all boards for current user (owned or member)
// @route   GET /api/boards
// @access  Private
export const getBoards = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const boards = await Board.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Attach card count summary for each board
    const boardsWithCounts = await Promise.all(
      boards.map(async (board) => {
        const cardCount = await Card.countDocuments({ board: board._id });
        const boardObj = board.toObject();
        boardObj.cardCount = cardCount;
        return boardObj;
      })
    );

    res.status(200).json({
      success: true,
      count: boardsWithCounts.length,
      data: boardsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board by ID with cards and permissions check
// @route   GET /api/boards/:id
// @access  Private
export const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    if (!checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have access to view this private board',
      });
    }

    // Fetch cards efficiently using indexed query
    const cards = await Card.find({ board: board._id })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        board,
        cards,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Board title is required',
      });
    }

    const board = await Board.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin',
        },
      ],
      columns: [
        { id: 'todo', title: 'To Do' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'done', title: 'Done' },
      ],
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedBoard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update board details
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    if (!checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this board',
      });
    }

    const { title, description } = req.body;
    if (title) board.title = title.trim();
    if (description !== undefined) board.description = description.trim();

    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedBoard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board and cascade delete cards & activities
// @route   DELETE /api/boards/:id
// @access  Private (Owner only)
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the board owner can delete this board',
      });
    }

    // Cascade delete associated cards and activities
    await Card.deleteMany({ board: board._id });
    await Activity.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    res.status(200).json({
      success: true,
      message: 'Board and all associated cards removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to board by email
// @route   POST /api/boards/:id/members
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required to invite a collaborator',
      });
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    if (!checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only existing board members can invite others',
      });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: `No user found registered with email ${email}`,
      });
    }

    const alreadyMember = board.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of this board',
      });
    }

    board.members.push({ user: userToAdd._id, role: 'member' });
    await board.save();

    await Activity.create({
      board: board._id,
      user: req.user._id,
      action: 'MEMBER_ADDED',
      details: { addedUser: userToAdd.name, addedEmail: userToAdd.email },
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: `${userToAdd.name} added to the board`,
      data: populatedBoard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent board activities
// @route   GET /api/boards/:id/activities
// @access  Private
export const getBoardActivities = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    if (!checkBoardAuthorization(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const activities = await Activity.find({ board: board._id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
