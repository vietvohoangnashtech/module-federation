import AuthState from './auth/types';

declare module 'mf_shared_lib/redux' {
  interface DynamicSliceRegistry {
    auth?: AuthState;
  }
}
