const mongoose = require('mongoose');

const codeSnapshotSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    code: {
      type: String,
      default: '',
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Manual Snapshot',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CodeSnapshot', codeSnapshotSchema);
