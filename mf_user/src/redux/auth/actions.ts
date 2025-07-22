import {createAction} from '@reduxjs/toolkit';

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginRequest = createAction<LoginPayload>('auth/loginRequest');
export const loginSuccess = createAction('auth/loginSuccess');
export const loginFailure = createAction('auth/loginFailure');

export interface SignupPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthday?: string;
  [key: string]: any;
}

export const signupRequest = createAction<SignupPayload>('auth/signupRequest');
export const signupSuccess = createAction('auth/signupSuccess');
export const signupFailure = createAction('auth/signupFailure');

export const logout = createAction('auth/logout');
