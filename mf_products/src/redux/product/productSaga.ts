import {call, put, takeLatest} from 'redux-saga/effects';
import {
  loadProductsRequest,
  loadProductsSuccess,
  loadProductsFailure,
} from './productSlice';
import {Product} from './types';

function fetchProductsApi(): Promise<Product[]> {
  // Simulate async API call to local products.json in public folder
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fetch('/products.json')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch products');
          return res.json();
        })
        .then(resolve)
        .catch(reject);
    }, 500); // Simulate network latency
  });
}

function* loadProductsSaga() {
  try {
    // Add a small delay to simulate loading
    yield new Promise((resolve) => setTimeout(resolve, 500));
    const products: Product[] = yield call(fetchProductsApi);
    yield put(loadProductsSuccess({products}));
  } catch (error: any) {
    yield put(loadProductsFailure(error.message || 'Failed to load products'));
  }
}

export function* productSaga() {
  yield takeLatest(loadProductsRequest.type, loadProductsSaga);
}
