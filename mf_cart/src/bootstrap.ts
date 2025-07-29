import {injectReducer} from 'mf_shared_lib/redux';
import {cartReducer} from './redux/cart';

const FEATURE_KEY = 'cart';
let isInitialized = false;

export const initializeCartFeature = () => {
  if (isInitialized) {
    return;
  }
  console.log('Initializing Cart Feature: Injecting reducer and saga.');
  injectReducer(FEATURE_KEY, cartReducer);
  isInitialized = true;
};
