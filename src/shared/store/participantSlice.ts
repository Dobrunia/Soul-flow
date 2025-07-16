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

export const { clearParticipants, setError } = participantSlice.actions;
export default participantSlice.reducer;

/* -------- селекторы -------- */
export const selectParticipants = (state: RootState) => state.participant.participants;
export const selectParticipantLoading = (state: RootState) => state.participant.loading;
export const selectParticipantError = (state: RootState) => state.participant.error;
