import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Минимальный тип пользователя из Supabase
export interface SupabaseUser {
  id: string;
  email: string | null;
  aud?: string;
  role?: string;
  created_at?: string;
  // Добавь другие поля, если используешь
}

interface UserState {
  user: SupabaseUser | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SupabaseUser | null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

// Селекторы
export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuth = (state: RootState) => Boolean(state.user.user);
