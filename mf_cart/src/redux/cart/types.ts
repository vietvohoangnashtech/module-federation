import {Product} from 'mf_products/redux/product/types';
export interface CartItem {
  product: Product;
  amount: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface AddToCartPayload {
  product: Product;
  amount?: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  amount: number;
}

export interface RemoveFromCartPayload {
  productId: string;
}

export interface CartSummary {
  total: number;
  itemCount: number;
  isEmpty: boolean;
}
