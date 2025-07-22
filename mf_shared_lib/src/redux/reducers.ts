import { combineReducers } from '@reduxjs/toolkit';

export const createRootReducer = (asyncReducers = {}) => {
  return combineReducers({
    ...asyncReducers,
  });
};