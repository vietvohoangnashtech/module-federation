import { Reducer } from '@reduxjs/toolkit';
import store from './store';
import { createRootReducer } from './reducers';

export function injectReducer(key: string, reducer: Reducer) {
  // Prevent re-injection
  if (store.asyncReducers[key]) {
    return;
  }
  store.asyncReducers[key] = reducer;
  store.replaceReducer(createRootReducer(store.asyncReducers));
}
