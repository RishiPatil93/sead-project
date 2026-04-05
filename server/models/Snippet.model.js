const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Snippet',
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['javascript', 'python', 'java', 'c', 'cpp', 'typescript', 'go', 'rust'],
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
  },
  {
    timestamps: true,
  }
);

snippetSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Snippet', snippetSchema);
