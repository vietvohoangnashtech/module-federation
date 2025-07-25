import type {NavigationState} from 'mf_shared_lib/compiled-types/redux/navigation/types';
import type {AuthState} from 'mf_user/compiled-types/redux/auth/types';
export interface ExtendedRootState {
  auth?: AuthState;
  navigationReducer: NavigationState;
}
