import {combineReducers} from '@reduxjs/toolkit';
import navigationReducer from './navigation/navigationSlice';
export const createRootReducer = (asyncReducers = {}) => {
  return combineReducers({
    ...asyncReducers,
    navigationReducer,
  });
};
