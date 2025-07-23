import type {AuthState} from './auth/types';
import type {NavigationState} from 'mf_shared_lib/compiled-types/redux/navigation/types';
export interface ExtendedRootState {
  auth?: AuthState;
  navigationReducer: NavigationState;
}
