import {configureStore, Store} from '@reduxjs/toolkit';
import createSagaMiddleware, {Task} from 'redux-saga';
import {createRootReducer} from './reducers';

const sagaMiddleware = createSagaMiddleware();

export interface ExtendedStore extends Store {
  asyncReducers: Record<string, any>;
  sagaMiddleware: typeof sagaMiddleware;
  runningSagas: Record<string, Task>;
}

const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({thunk: false}).concat(sagaMiddleware),
}) as ExtendedStore;

// Attach the dynamic managers to the store instance
store.asyncReducers = {};
store.runningSagas = {};
store.sagaMiddleware = sagaMiddleware;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
