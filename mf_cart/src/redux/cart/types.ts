export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
}

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
