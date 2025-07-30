import {ProductState} from './product';

declare module 'mf_shared_lib/redux' {
  interface DynamicSliceRegistry {
    product?: ProductState;
  }
}
