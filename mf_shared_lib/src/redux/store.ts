import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {createRootReducer} from './reducers';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

(store as any).asyncReducers = {};
(store as any).sagaMiddleware = sagaMiddleware;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
