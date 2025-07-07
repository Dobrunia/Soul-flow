import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Profile } from '@/types/types';

interface ProfileState {
  profile: Profile | null;
}

const initialState: ProfileState = {
  profile: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profile = action.payload;
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

/* -------- селектор -------- */
export const selectProfile = (state: RootState) => state.profile.profile;
