import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import chatsReducer from './chatsSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    chats: chatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
