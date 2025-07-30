import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  CartState,
  CartItem,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
} from './types';

const calculateCartTotals = (items: CartItem[]) => {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.amount,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.amount, 0);
  return {total, itemCount};
};

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
  success: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartRequest(state, action: PayloadAction<AddToCartPayload>) {
      state.loading = true;
      const {product, amount = 1} = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].amount += amount;
      } else {
        state.items.push({product, amount});
      }
      const {total, itemCount} = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      state.loading = false;
      state.error = null;
      state.success = true;
    },

    removeFromCartRequest(
      state,
      _action: PayloadAction<RemoveFromCartPayload>
    ) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    removeFromCartSuccess(state, action: PayloadAction<RemoveFromCartPayload>) {
      const {productId} = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);
      const {total, itemCount} = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    removeFromCartFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    updateCartItemRequest(
      state,
      _action: PayloadAction<UpdateCartItemPayload>
    ) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateCartItemSuccess(state, action: PayloadAction<UpdateCartItemPayload>) {
      const {productId, amount} = action.payload;
      if (amount <= 0) {
        state.items = state.items.filter(
          (item) => item.product.id !== productId
        );
      } else {
        const existingItemIndex = state.items.findIndex(
          (item) => item.product.id === productId
        );
        if (existingItemIndex >= 0) {
          state.items[existingItemIndex].amount = amount;
        }
      }
      const {total, itemCount} = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    updateCartItemFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    incrementItem(state, action: PayloadAction<{productId: string}>) {
      const {productId} = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === productId
      );
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].amount += 1;
        const {total, itemCount} = calculateCartTotals(state.items);
        state.total = total;
        state.itemCount = itemCount;
      }
    },

    decrementItem(state, action: PayloadAction<{productId: string}>) {
      const {productId} = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === productId
      );
      if (existingItemIndex >= 0) {
        if (state.items[existingItemIndex].amount > 1) {
          state.items[existingItemIndex].amount -= 1;
        } else {
          state.items = state.items.filter(
            (item) => item.product.id !== productId
          );
        }
        const {total, itemCount} = calculateCartTotals(state.items);
        state.total = total;
        state.itemCount = itemCount;
      }
    },

    clearCart(state) {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.error = null;
      state.success = false;
      state.loading = false;
    },

    setCartLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setCartError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },

    loadCartFromStorage(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      const {total, itemCount} = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  addToCartRequest,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFailure,
  updateCartItemRequest,
  updateCartItemSuccess,
  updateCartItemFailure,
  incrementItem,
  decrementItem,
  clearCart,
  setCartLoading,
  setCartError,
  loadCartFromStorage,
} = cartSlice.actions;
export default cartSlice.reducer;
