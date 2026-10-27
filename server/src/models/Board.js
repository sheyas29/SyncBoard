import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      enum: ['todo', 'in_progress', 'done'],
    },
    title: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a board title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
      },
    ],
    columns: {
      type: [columnSchema],
      default: [
        { id: 'todo', title: 'To Do' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'done', title: 'Done' },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for efficient querying
boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ 'members.user': 1 });

const Board = mongoose.model('Board', boardSchema);
export default Board;
