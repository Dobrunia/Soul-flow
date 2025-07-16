import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import chatReducer from './chatSlice';
import messageReducer from './messageSlice';
import participantReducer from './participantSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    chat: chatReducer,
    message: messageReducer,
    participant: participantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
