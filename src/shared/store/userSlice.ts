import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Тип пользователя из Supabase
export interface Profile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'dnd' | 'invisible';
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: Profile | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Profile | null>) {
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
