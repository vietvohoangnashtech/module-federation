import {injectReducer, injectSaga} from 'mf_shared_lib/redux';
import {productReducer, productSaga} from './redux/product';

const FEATURE_KEY = 'product';
let isInitialized = false;

export const initializeProductFeature = () => {
  if (isInitialized) {
    return;
  }
  console.log('Initializing Product Feature: Injecting reducer and saga.');
  injectReducer(FEATURE_KEY, productReducer);
  injectSaga(FEATURE_KEY, productSaga);
  isInitialized = true;
};
