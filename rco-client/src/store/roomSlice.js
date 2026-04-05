import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentRoom: null,
  collaborators: [],
  snapshots: [],
  isConnected: false,
  language: 'javascript',
  isViewingSnapshot: false,
  viewingSnapshot: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
      if (action.payload?.language) {
        state.language = action.payload.language;
      }
    },
    clearRoom: (state) => {
      state.currentRoom = null;
      state.collaborators = [];
      state.snapshots = [];
      state.isConnected = false;
      state.isViewingSnapshot = false;
      state.viewingSnapshot = null;
    },
    setCollaborators: (state, action) => {
      state.collaborators = action.payload;
    },
    addCollaborator: (state, action) => {
      const exists = state.collaborators.find(c => c.id === action.payload.id);
      if (!exists) {
        state.collaborators.push(action.payload);
      }
    },
    removeCollaborator: (state, action) => {
      state.collaborators = state.collaborators.filter(c => c.id !== action.payload);
    },
    setSnapshots: (state, action) => {
      state.snapshots = action.payload;
    },
    addSnapshot: (state, action) => {
      state.snapshots.unshift(action.payload);
    },
    removeSnapshot: (state, action) => {
      state.snapshots = state.snapshots.filter(s => s._id !== action.payload);
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setViewingSnapshot: (state, action) => {
      state.isViewingSnapshot = !!action.payload;
      state.viewingSnapshot = action.payload;
    },
  },
});

export const {
  setCurrentRoom,
  clearRoom,
  setCollaborators,
  addCollaborator,
  removeCollaborator,
  setSnapshots,
  addSnapshot,
  removeSnapshot,
  setConnected,
  setLanguage,
  setViewingSnapshot,
} = roomSlice.actions;

// Selectors
export const selectCurrentRoom = (state) => state.room.currentRoom;
export const selectCollaborators = (state) => state.room.collaborators;
export const selectSnapshots = (state) => state.room.snapshots;
export const selectIsConnected = (state) => state.room.isConnected;
export const selectLanguage = (state) => state.room.language;
export const selectIsViewingSnapshot = (state) => state.room.isViewingSnapshot;
export const selectViewingSnapshot = (state) => state.room.viewingSnapshot;

export default roomSlice.reducer;
