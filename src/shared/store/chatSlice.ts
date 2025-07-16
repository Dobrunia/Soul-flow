import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { chatService } from '@/shared/lib/supabase/Classes/chatService';
import type { Chat } from '@/types/types';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

// Async thunk для загрузки чатов
export const fetchChats = createAsyncThunk('chat/fetchChats', async (userId: string) => {
  const chatsData = await chatService.listRecentChats(userId, 20);
  return chatsData;
});

// Async thunk для загрузки отдельного чата
export const fetchChat = createAsyncThunk('chat/fetchChat', async (chatId: string) => {
  const chatData = await chatService.getChat(chatId);
  return chatData;
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
      // fetchChats
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
      })
      // fetchChat
      .addCase(fetchChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChat.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentChat = action.payload;
      })
      .addCase(fetchChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить чат';
      });
  },
});

export const { clearChats, setError } = chatSlice.actions;
export default chatSlice.reducer;

/* -------- селекторы -------- */
export const selectChats = (state: RootState) => state.chat.chats;
export const selectCurrentChat = (state: RootState) => state.chat.currentChat;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;
