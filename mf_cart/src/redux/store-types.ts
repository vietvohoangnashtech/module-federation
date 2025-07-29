import type {AuthState} from 'mf_user/redux/auth/types';

export interface ProductsState {
  items: Array<{id: string; name: string; price: number}>;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: Array<{productId: string; quantity: number}>;
  total: number;
}

// Augment the shared lib's DynamicSliceRegistry
declare module 'mf_shared_lib/redux' {
  interface DynamicSliceRegistry {
    auth?: AuthState;
    products?: ProductsState;
    cart?: CartState;
  }
}
