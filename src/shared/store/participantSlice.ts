import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { participantService } from '@/shared/lib/supabase/Classes/participantService';
import type { Profile } from '@/types/types';

interface ParticipantState {
  participants: Record<string, Profile[]>; // chatId -> participants
  loading: boolean;
  error: string | null;
}

const initialState: ParticipantState = {
  participants: {},
  loading: false,
  error: null,
};

// Async thunk для загрузки участников чата
export const fetchChatParticipants = createAsyncThunk(
  'participant/fetchChatParticipants',
  async (chatId: string) => {
    const participants = await participantService.getChatParticipants(chatId);
    return { chatId, participants };
  }
);

const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    clearParticipants(state) {
      state.participants = {};
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    // Обновляет статус пользователя во всех чатах где он участвует
    updateUserStatus(state, action: PayloadAction<{ userId: string; status: string }>) {
      const { userId, status } = action.payload;

      // Проходим по всем чатам и обновляем статус пользователя
      Object.keys(state.participants).forEach((chatId) => {
        const participants = state.participants[chatId];
        const userIndex = participants.findIndex((p) => p.id === userId);
        if (userIndex !== -1) {
          participants[userIndex].status = status as any;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatParticipants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatParticipants.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.participants[action.payload.chatId] = action.payload.participants;
      })
      .addCase(fetchChatParticipants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить участников';
      });
  },
});

export const { clearParticipants, setError, updateUserStatus } = participantSlice.actions;
export default participantSlice.reducer;

import { createSelector } from '@reduxjs/toolkit';

/* -------- селекторы -------- */
export const selectAllParticipants = (state: RootState) => state.participant.participants;
export const selectParticipantLoading = (state: RootState) => state.participant.loading;
export const selectParticipantError = (state: RootState) => state.participant.error;

// Мемоизированный селектор для участников конкретного чата
export const selectParticipants = createSelector(
  [selectAllParticipants, (state: RootState, chatId: string) => chatId],
  (allParticipants, chatId) => allParticipants[chatId] || []
);

// Селектор для проверки загруженности участников чата
export const selectChatParticipantsLoaded = createSelector(
  [selectAllParticipants, (state: RootState, chatId: string) => chatId],
  (allParticipants, chatId) => chatId in allParticipants
);
