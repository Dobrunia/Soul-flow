import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { chatService } from '@/shared/lib/supabase/Classes/chatService';
import type { Chat, Message, Profile } from '@/types/types';

interface ChatState {
  chats: Array<{
    chat: Chat;
    lastMessage?: Message & { sender: Profile };
    participants?: Profile[];
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  loading: false,
  error: null,
};

// Async thunk для загрузки чатов
export const fetchChats = createAsyncThunk('chat/fetchChats', async (userId: string) => {
  const chatsData = await chatService.listRecentChatsWithLastMessage(userId, 20);
  return chatsData;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChats(state) {
      state.chats = [];
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить чаты';
      });
  },
});

export const { clearChats, setError } = chatSlice.actions;
export default chatSlice.reducer;

/* -------- селекторы -------- */
export const selectChats = (state: RootState) => state.chat.chats;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;
