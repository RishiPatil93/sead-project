import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import roomReducer from './roomSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['room/setSnapshots', 'room/addSnapshot'],
      },
    }),
});

export default store;
