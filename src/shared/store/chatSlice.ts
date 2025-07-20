import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { chatService } from '@/shared/lib/supabase/Classes/chatService';
import type { Chat } from '@/types/types';
import { createSelector } from '@reduxjs/toolkit';

interface ChatState {
  chats: Chat[];
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
  const chatsData = await chatService.listRecentChats(userId, 20);
  return chatsData;
});

// Async thunk для загрузки отдельного чата
export const fetchChat = createAsyncThunk('chat/fetchChat', async (chatId: string) => {
  const chatData = await chatService.getChat(chatId);
  return chatData;
});

// Async thunk для создания прямого чата
export const createDirectChat = createAsyncThunk(
  'chat/createDirectChat',
  async ({ userId1, userId2 }: { userId1: string; userId2: string }) => {
    const chat = await chatService.createDirectChat(userId1, userId2);
    return chat;
  }
);

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
    // Добавляет новый чат в список (для realtime обновлений)
    addChat(state, action: PayloadAction<Chat>) {
      const newChat = action.payload;
      // Проверяем, нет ли уже такого чата
      if (!state.chats.find((chat) => chat.id === newChat.id)) {
        state.chats.unshift(newChat); // Добавляем в начало списка
      }
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
      })
      .addCase(fetchChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить чат';
      })
      // createDirectChat
      .addCase(createDirectChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDirectChat.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const newChat = action.payload;
        // Добавляем чат если его еще нет в списке
        if (!state.chats.find((chat) => chat.id === newChat.id)) {
          state.chats.unshift(newChat);
        }
      })
      .addCase(createDirectChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось создать чат';
      });
  },
});

export const { clearChats, setError, addChat } = chatSlice.actions;
export default chatSlice.reducer;

/* -------- селекторы -------- */
export const selectChats = (state: RootState) => state.chat.chats;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;

// Селектор для получения чата по ID
export const selectChatById = createSelector(
  [selectChats, (state: RootState, chatId: string) => chatId],
  (chats, chatId) => chats.find((chat) => chat.id === chatId) || null
);

// Селектор для проверки загруженности чатов
export const selectChatsLoaded = createSelector(
  [selectChats, selectChatLoading],
  (chats, loading) => chats.length > 0 && !loading
);

// Селектор для проверки загруженности конкретного чата
export const selectChatLoaded = createSelector(
  [selectChats, (state: RootState, chatId: string) => chatId],
  (chats, chatId) => chats.some((chat) => chat.id === chatId)
);
