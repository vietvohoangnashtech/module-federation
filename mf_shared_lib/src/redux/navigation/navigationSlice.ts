import {createSlice} from '@reduxjs/toolkit';
import type {NavigationState, PendingNavigation} from './types';

const initialState: NavigationState = {
  pendingNavigation: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    requestNavigation: (state, action: {payload: PendingNavigation}) => {
      state.pendingNavigation = action.payload;
    },
    clearNavigation: (state) => {
      state.pendingNavigation = null;
    },
  },
});

export const {requestNavigation, clearNavigation} = navigationSlice.actions;
export default navigationSlice.reducer;
