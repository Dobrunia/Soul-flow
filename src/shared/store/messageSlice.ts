import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { messageService } from '@/shared/lib/supabase/Classes/messageService';
import type { Message, Profile, MessageStatus } from '@/types/types';

interface MessageState {
  chatMessages: Record<string, Array<Message>>; // chatId -> messages (без sender)
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  chatMessages: {},
  loading: false,
  error: null,
};

// Async thunk для загрузки сообщений чата
export const fetchChatMessages = createAsyncThunk(
  'message/fetchChatMessages',
  async ({ chatId, messageLimit }: { chatId: string; messageLimit?: number }) => {
    const messages = await messageService.getChatMessages(chatId, messageLimit);
    return { chatId, messages };
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
      state.chatMessages = {};
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    // Добавляет новое сообщение в чат (для realtime обновлений)
    addMessage(state, action: PayloadAction<{ chatId: string; message: Message }>) {
      const { chatId, message } = action.payload;

      if (!state.chatMessages[chatId]) {
        state.chatMessages[chatId] = [];
      }

      // Проверяем, нет ли уже такого сообщения
      const existingMessageIndex = state.chatMessages[chatId].findIndex((m) => m.id === message.id);
      if (existingMessageIndex === -1) {
        state.chatMessages[chatId].push(message);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchChatMessages
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.chatMessages[action.payload.chatId] = action.payload.messages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
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
        const { chatId, message } = action.payload;

        // Если сообщение есть, добавляем его в chatMessages (если его там еще нет)
        if (message) {
          if (!state.chatMessages[chatId]) {
            state.chatMessages[chatId] = [];
          }

          // Проверяем, есть ли уже это сообщение в массиве
          const existingMessageIndex = state.chatMessages[chatId].findIndex(
            (m) => m.id === message.id
          );
          if (existingMessageIndex === -1) {
            // Добавляем сообщение в конец массива (как последнее)
            state.chatMessages[chatId].push(message);
          } else {
            // Обновляем существующее сообщение
            state.chatMessages[chatId][existingMessageIndex] = message;
          }
        } else {
          // Если сообщения нет, инициализируем пустой массив
          if (!state.chatMessages[chatId]) {
            state.chatMessages[chatId] = [];
          }
        }
      })
      .addCase(fetchLastMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить последнее сообщение';
      });
  },
});

export const { clearMessages, setError, addMessage } = messageSlice.actions;
export default messageSlice.reducer;

import { createSelector } from '@reduxjs/toolkit';

/* -------- селекторы -------- */
export const selectChatMessages = (state: RootState) => state.message.chatMessages;
export const selectMessageLoading = (state: RootState) => state.message.loading;
export const selectMessageError = (state: RootState) => state.message.error;

// Мемоизированный селектор для последнего сообщения конкретного чата
export const selectLastMessage = createSelector(
  [selectChatMessages, (state: RootState, chatId: string) => chatId],
  (chatMessages, chatId) => {
    const messages = chatMessages[chatId];
    if (!messages || messages.length === 0) {
      return null;
    }
    // Возвращаем последнее сообщение (последний элемент массива)
    return messages[messages.length - 1];
  }
);

// Селектор для проверки загруженности сообщений чата
export const selectChatMessagesLoaded = createSelector(
  [selectChatMessages, (state: RootState, chatId: string) => chatId],
  (chatMessages, chatId) => chatId in chatMessages
);
