import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
