import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Profile } from '@/types/types';
import { userService } from '@/shared/lib/supabase/Classes/userService';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Async thunk для инициализации профиля
export const initializeProfile = createAsyncThunk('profile/initialize', async () => {
  const profile = await userService.getMyProfile();
  return profile;
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profile = action.payload;
    },
    clearProfile(state) {
      state.profile = null;
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.profile = action.payload;
      })
      .addCase(initializeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить профиль';
        state.profile = null;
      });
  },
});

export const { setProfile, clearProfile, setError } = profileSlice.actions;
export default profileSlice.reducer;

/* -------- селекторы -------- */
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoading = (state: RootState) => state.profile.loading;
export const selectProfileError = (state: RootState) => state.profile.error;

// Мемоизированный селектор для проверки авторизации
export const selectIsAuthenticated = createSelector(
  [selectProfile, selectProfileLoading],
  (profile, loading) => !loading && profile !== null
);

// Мемоизированный селектор для проверки готовности профиля
export const selectProfileReady = createSelector(
  [selectProfile, selectProfileLoading, selectProfileError],
  (profile, loading, error) => !loading && !error && profile !== null
);

// Мемоизированный селектор для получения имени пользователя
export const selectUsername = createSelector(
  [selectProfile],
  (profile) => profile?.username || 'Пользователь'
);

// Мемоизированный селектор для получения email
export const selectUserEmail = createSelector([selectProfile], (profile) => profile?.email || '');

// Мемоизированный селектор для получения аватара
export const selectUserAvatar = createSelector(
  [selectProfile],
  (profile) => profile?.avatar_url || undefined
);

// Мемоизированный селектор для получения статуса пользователя
export const selectUserStatus = createSelector(
  [selectProfile],
  (profile) => profile?.status || 'offline'
);
