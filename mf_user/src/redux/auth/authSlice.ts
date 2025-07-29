import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {AuthState, SimpleUser, SimpleSession} from './types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  error: null,
  profile: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(
      state,
      _action: PayloadAction<{email: string; password: string}>
    ) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{user: SimpleUser; session: SimpleSession}>
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },
    signupRequest(state, _action: PayloadAction<any>) {
      state.loading = true;
      state.error = null;
    },
    signupSuccess(
      state,
      action: PayloadAction<{user: SimpleUser; session: SimpleSession}>
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
      state.error = null;
    },
    signupFailure(state, action: PayloadAction<string>) {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.session = null;
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchUserProfileRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchUserProfileSuccess(state, action: PayloadAction<any>) {
      state.profile = action.payload;
      state.loading = false;
    },
    fetchUserProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  logout,
  fetchUserProfileRequest,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  logoutSuccess,
  logoutFailure,
} = authSlice.actions;

export default authSlice.reducer;
