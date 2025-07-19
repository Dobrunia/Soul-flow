import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { messageService } from '@/shared/lib/supabase/Classes/messageService';
import type { Message, Profile, MessageStatus } from '@/types/types';

interface MessageState {
  chatMessages: Record<string, Array<Message & { sender: Profile }>>; // chatId -> messages
  lastMessages: Record<string, (Message & { sender: Profile }) | null>; // chatId -> lastMessage
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  chatMessages: {},
  lastMessages: {},
  loading: false,
  error: null,
};

// Async thunk для загрузки последних сообщений чата
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

// Async thunk для отметки сообщений как прочитанных
export const markMessagesAsRead = createAsyncThunk(
  'message/markMessagesAsRead',
  async ({ chatId, userId }: { chatId: string; userId: string }) => {
    await messageService.markMessagesAsRead(chatId, userId);
    return { chatId, userId };
  }
);

// Async thunk для отметки конкретного сообщения как прочитанного
export const markMessageAsRead = createAsyncThunk(
  'message/markMessageAsRead',
  async (messageId: string) => {
    await messageService.markMessageAsRead(messageId);
    return messageId;
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessages(state) {
      state.chatMessages = {};
      state.lastMessages = {};
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    // Обновляем статус сообщения локально
    updateMessageStatus(
      state,
      action: PayloadAction<{ messageId: string; status: MessageStatus }>
    ) {
      const { messageId, status } = action.payload;

      // Обновляем в chatMessages
      Object.keys(state.chatMessages).forEach((chatId) => {
        const messages = state.chatMessages[chatId];
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].status = status;
        }
      });

      // Обновляем в lastMessages
      Object.keys(state.lastMessages).forEach((chatId) => {
        const message = state.lastMessages[chatId];
        if (message && message.id === messageId) {
          message.status = status;
        }
      });
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
        state.lastMessages[action.payload.chatId] = action.payload.message;
      })
      .addCase(fetchLastMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить последнее сообщение';
      })
      // markMessagesAsRead
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { chatId, userId } = action.payload;

        // Обновляем статус всех непрочитанных сообщений в чате (кроме своих)
        if (state.chatMessages[chatId]) {
          state.chatMessages[chatId].forEach((message) => {
            if (message.sender_id !== userId && message.status === 'unread') {
              message.status = 'read';
            }
          });
        }

        // Обновляем последнее сообщение если нужно
        const lastMessage = state.lastMessages[chatId];
        if (lastMessage && lastMessage.sender_id !== userId && lastMessage.status === 'unread') {
          lastMessage.status = 'read';
        }
      })
      // markMessageAsRead
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;

        // Обновляем статус конкретного сообщения
        Object.keys(state.chatMessages).forEach((chatId) => {
          const messages = state.chatMessages[chatId];
          const messageIndex = messages.findIndex((m) => m.id === messageId);
          if (messageIndex !== -1) {
            messages[messageIndex].status = 'read';
          }
        });

        // Обновляем в lastMessages если это последнее сообщение
        Object.keys(state.lastMessages).forEach((chatId) => {
          const message = state.lastMessages[chatId];
          if (message && message.id === messageId) {
            message.status = 'read';
          }
        });
      });
  },
});

export const { clearMessages, setError, updateMessageStatus } = messageSlice.actions;
export default messageSlice.reducer;

import { createSelector } from '@reduxjs/toolkit';

/* -------- селекторы -------- */
export const selectChatMessages = (state: RootState) => state.message.chatMessages;
export const selectLastMessages = (state: RootState) => state.message.lastMessages;
export const selectMessageLoading = (state: RootState) => state.message.loading;
export const selectMessageError = (state: RootState) => state.message.error;

// Мемоизированный селектор для последнего сообщения конкретного чата
export const selectLastMessage = createSelector(
  [selectLastMessages, (state: RootState, chatId: string) => chatId],
  (lastMessages, chatId) => lastMessages[chatId] || null
);

// Селектор для проверки загруженности сообщений чата
export const selectChatMessagesLoaded = createSelector(
  [selectChatMessages, (state: RootState, chatId: string) => chatId],
  (chatMessages, chatId) => chatId in chatMessages
);

// Селектор для проверки загруженности последнего сообщения чата
export const selectLastMessageLoaded = createSelector(
  [selectLastMessages, (state: RootState, chatId: string) => chatId],
  (lastMessages, chatId) => chatId in lastMessages
);
