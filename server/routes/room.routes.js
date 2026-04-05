const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRoomById,
  getMyRooms,
  saveSnapshot,
  getSnapshots,
  deleteSnapshot,
} = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All room routes require authentication

router.post('/create', createRoom);
router.get('/my-rooms', getMyRooms);
router.get('/:roomId', getRoomById);
router.post('/:roomId/snapshots', saveSnapshot);
router.get('/:roomId/snapshots', getSnapshots);
router.delete('/:roomId/snapshots/:snapshotId', deleteSnapshot);

module.exports = router;
