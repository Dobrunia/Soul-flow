import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { ChatBrief } from '@/types/types';

interface ChatsState {
  byId: Record<string, ChatBrief>;
  allIds: string[];
}

const initialState: ChatsState = {
  byId: {},
  allIds: [],
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<ChatBrief[]>) {
      state.byId = {};
      state.allIds = [];
      action.payload.forEach((chat) => {
        state.byId[chat.id] = chat;
        state.allIds.push(chat.id);
      });
    },
    updateChat(state, action: PayloadAction<ChatBrief>) {
      const chat = action.payload;
      state.byId[chat.id] = chat;
      if (!state.allIds.includes(chat.id)) {
        state.allIds.push(chat.id);
      }
    },
    // Можно добавить removeChat, clearChats и т.д.
  },
});

export const { setChats, updateChat } = chatsSlice.actions;
export default chatsSlice.reducer;

// --------- Селекторы ---------

export const selectChats = (state: RootState): ChatBrief[] =>
  (state.chats as ChatsState).allIds.map((id: string) => (state.chats as ChatsState).byId[id]);
export const selectChatById =
  (id: string) =>
  (state: RootState): ChatBrief | undefined =>
    (state.chats as ChatsState).byId[id];
