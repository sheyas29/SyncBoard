import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CARD_CREATED', 'CARD_MOVED', 'CARD_UPDATED', 'CARD_DELETED', 'MEMBER_ADDED'],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ board: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
