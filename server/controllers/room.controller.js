const Room = require('../models/Room.model');
const CodeSnapshot = require('../models/CodeSnapshot.model');

// Room controllers (rely on MongoDB)

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Private
const createRoom = async (req, res, next) => {
  try {
    const { name, language } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required.',
      });
    }

    // Create persistent room in MongoDB

    const room = await Room.create({
      name,
      language: language || 'javascript',
      createdBy: req.user._id,
    });

    await room.populate('createdBy', 'username email role color');

    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        language: room.language,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by roomId
// @route   GET /api/rooms/:roomId
// @access  Private
const getRoomById = async (req, res, next) => {
  try {
    // Fetch room from MongoDB

    const room = await Room.findOne({ roomId: req.params.roomId }).populate(
      'createdBy',
      'username email role color'
    );

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or has been closed.',
      });
    }

    res.json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        language: room.language,
        currentCode: room.currentCode,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rooms created by current user
// @route   GET /api/rooms/my-rooms
// @access  Private
const getMyRooms = async (req, res, next) => {
  try {
    // Return rooms that the user created

    const rooms = await Room.find({ createdBy: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'username');

    res.json({
      success: true,
      rooms: rooms.map((room) => ({
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        language: room.language,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a manual code snapshot
// @route   POST /api/rooms/:roomId/snapshots
// @access  Private
const saveSnapshot = async (req, res, next) => {
  try {
    const { code, title } = req.body;
    
    // Save snapshot in MongoDB

    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    room.currentCode = code;
    await room.save();

    const snapshot = await CodeSnapshot.create({
      roomId: room._id,
      code,
      title: title || 'Manual Snapshot',
      savedBy: req.user._id,
    });
    
    await snapshot.populate('savedBy', 'username color');

    res.status(201).json({ success: true, snapshot });
  } catch (error) {
    next(error);
  }
};

// @desc    Get code snapshots for a room
// @route   GET /api/rooms/:roomId/snapshots
// @access  Private
const getSnapshots = async (req, res, next) => {
  try {
    // Return snapshots from MongoDB

    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const snapshots = await CodeSnapshot.find({ roomId: room._id })
      .sort({ createdAt: -1 })
      .populate('savedBy', 'username color');

    res.json({ success: true, snapshots });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a snapshot
// @route   DELETE /api/rooms/:roomId/snapshots/:snapshotId
// @access  Private (Instructor or Room Owner only)
const deleteSnapshot = async (req, res, next) => {
  try {
    const { roomId, snapshotId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const isInstructor = req.user.role === 'instructor';
    const isRoomOwner = room.createdBy?.toString() === req.user._id.toString();

    if (!isInstructor && !isRoomOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors or room owners can delete snapshots.',
      });
    }

    const snapshot = await CodeSnapshot.findOne({ _id: snapshotId, roomId: room._id });
    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Snapshot not found' });
    }

    await CodeSnapshot.findByIdAndDelete(snapshotId);

    res.json({ success: true, message: 'Snapshot deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoom, getRoomById, getMyRooms, saveSnapshot, getSnapshots, deleteSnapshot };
