import {createReducer} from '@reduxjs/toolkit';
import * as actions from './actions';

export interface AuthState {
  isAuthenticated: boolean;
  user: any;
  error: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

export const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(actions.loginSuccess, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(actions.loginFailure, (state, action) => {
      console.error('Login failure:', action.payload);
      state.isAuthenticated = false;
      state.user = null;
      state.error =
        typeof action.payload === 'string'
          ? action.payload
          : String(action.payload);
    })
    .addCase(actions.signupSuccess, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(actions.signupFailure, (state, action) => {
      console.error('Signup failure:', action.payload);
      state.isAuthenticated = false;
      state.user = null;
      state.error =
        typeof action.payload === 'string'
          ? action.payload
          : String(action.payload);
    })
    .addCase(actions.logout, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    });
});
