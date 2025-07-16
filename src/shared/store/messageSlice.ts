import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { messageService } from '@/shared/lib/supabase/Classes/messageService';
import type { Message, Profile } from '@/types/types';

interface MessageState {
  messages: Array<Message & { sender: Profile }>;
  lastMessages: Record<string, (Message & { sender: Profile }) | null>; // chatId -> lastMessage
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  lastMessages: {},
  loading: false,
  error: null,
};

// Async thunk для загрузки последних сообщений чата
export const fetchLastMessages = createAsyncThunk(
  'message/fetchLastMessages',
  async ({ chatId, messageLimit }: { chatId: string; messageLimit?: number }) => {
    const messages = await messageService.getLastMessages(chatId, messageLimit);
    return messages;
  }
);

// Async thunk для загрузки последнего сообщения чата
export const fetchLastMessage = createAsyncThunk(
  'message/fetchLastMessage',
  async (chatId: string) => {
    const message = await messageService.getLastMessage(chatId);
    return { chatId, message };
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessages(state) {
      state.messages = [];
      state.lastMessages = {};
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLastMessages
      .addCase(fetchLastMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.messages = action.payload;
      })
      .addCase(fetchLastMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить сообщения';
      })
      // fetchLastMessage
      .addCase(fetchLastMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastMessages[action.payload.chatId] = action.payload.message;
      })
      .addCase(fetchLastMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить последнее сообщение';
      });
  },
});

export const { clearMessages, setError } = messageSlice.actions;
export default messageSlice.reducer;

/* -------- селекторы -------- */
export const selectMessages = (state: RootState) => state.message.messages;
export const selectLastMessage = (state: RootState) => state.message.lastMessages;
export const selectMessageLoading = (state: RootState) => state.message.loading;
export const selectMessageError = (state: RootState) => state.message.error;
