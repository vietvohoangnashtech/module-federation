import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  ProductState,
  LoadProductsPayload,
  AddProductPayload,
  UpdateProductPayload,
  RemoveProductPayload,
} from './types';

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  success: false,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    loadProductsRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    loadProductsSuccess(state, action: PayloadAction<LoadProductsPayload>) {
      state.products = action.payload.products;
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    loadProductsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    addProductRequest(state, _action: PayloadAction<AddProductPayload>) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    addProductSuccess(state, action: PayloadAction<AddProductPayload>) {
      state.products.push(action.payload.product);
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    addProductFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    updateProductRequest(state, _action: PayloadAction<UpdateProductPayload>) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateProductSuccess(state, action: PayloadAction<UpdateProductPayload>) {
      const {productId, updates} = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        Object.assign(product, updates);
      }
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    updateProductFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    removeProductRequest(state, _action: PayloadAction<RemoveProductPayload>) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    removeProductSuccess(state, action: PayloadAction<RemoveProductPayload>) {
      state.products = state.products.filter(
        (p) => p.id !== action.payload.productId
      );
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    removeProductFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    setProductLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setProductError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },

    clearProducts(state) {
      state.products = [];
      state.error = null;
      state.success = false;
      state.loading = false;
    },
  },
});

export const {
  loadProductsRequest,
  loadProductsSuccess,
  loadProductsFailure,
  addProductRequest,
  addProductSuccess,
  addProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  removeProductRequest,
  removeProductSuccess,
  removeProductFailure,
  setProductLoading,
  setProductError,
  clearProducts,
} = productSlice.actions;
export default productSlice.reducer;
