import {injectSaga, injectReducer} from 'mf_shared_lib/redux';
import {authSaga} from './redux/auth/saga';
import authReducer from './redux/auth/authSlice';

const FEATURE_KEY = 'auth';
let isInitialized = false;

export const initializeUserFeature = () => {
  // This idempotency check ensures the logic runs only once.
  if (isInitialized) {
    return;
  }
  console.log('Initializing User Feature: Injecting reducer and saga.');
  injectReducer(FEATURE_KEY, authReducer);
  injectSaga(FEATURE_KEY, authSaga);

  isInitialized = true;
};
