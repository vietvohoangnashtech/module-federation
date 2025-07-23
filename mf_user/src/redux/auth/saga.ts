import {call, put, takeLatest, CallEffect, PutEffect} from 'redux-saga/effects';
import {supabase} from '../../supabase';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  fetchUserProfileRequest,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  logoutSuccess,
  logout,
  logoutFailure,
} from './authSlice';
import {requestNavigation} from 'mf_shared_lib/navigationSlice';
interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  email: string;
  password: string;
  [key: string]: any;
}

interface SagaAction<T> {
  type: string;
  payload: T;
}

interface SupabaseResponse<T> {
  data: T;
  error: any;
}

function* loginSaga(
  action: SagaAction<LoginPayload>
): Generator<CallEffect | PutEffect<any>, void, SupabaseResponse<any>> {
  try {
    const {email, password} = action.payload;
    const {data, error} = yield call([supabase.auth, 'signInWithPassword'], {
      email,
      password,
    });

    if (error) {
      yield put(loginFailure(error.message || String(error)));
    } else {
      yield put(loginSuccess({user: data.user, session: data.session}));
      yield put(requestNavigation({path: '/profile', replace: false}));
    }
  } catch (error: any) {
    yield put(loginFailure(error?.message || String(error)));
  }
}

function* logoutSaga(): Generator<
  CallEffect | PutEffect<any>,
  void,
  SupabaseResponse<any>
> {
  try {
    const {error} = yield call([supabase.auth, 'signOut']);
    console.log('logoutSaga error:', error);
    if (error) {
      yield put(logoutFailure(error.message || String(error)));
    } else {
      yield put(logoutSuccess());
      yield put(requestNavigation({path: '/login', replace: true}));
    }
  } catch (error: any) {
    yield put(logoutFailure(error?.message || String(error)));
  }
}

function* signupSaga(
  action: SagaAction<SignupPayload>
): Generator<CallEffect | PutEffect<any>, void, SupabaseResponse<any>> {
  try {
    const {email, password, ...rest} = action.payload;
    const {data, error} = yield call([supabase.auth, 'signUp'], {
      email,
      password,
      options: {
        data: rest,
      },
    });

    if (error) {
      yield put(signupFailure(error.message || String(error)));
    } else {
      yield put(
        signupSuccess({user: data.user.user, session: data.user.session})
      );
    }
  } catch (error: any) {
    yield put(signupFailure(error?.message || String(error)));
  }
}

function* fetchUserProfileSaga(
  action: SagaAction<{id: string}>
): Generator<CallEffect | PutEffect<any>, void, SupabaseResponse<any>> {
  try {
    console.log('fetchUserProfileSaga action:', action);
    const id = action.payload || '';
    const {data, error} = yield call([
      supabase.from('profiles').select('*').eq('id', id),
      'single',
    ]);
    if (error) {
      yield put(fetchUserProfileFailure(error.message || String(error)));
    } else {
      yield put(fetchUserProfileSuccess(data));
    }
  } catch (error: any) {
    yield put(fetchUserProfileFailure(error?.message || String(error)));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(signupRequest.type, signupSaga);
  yield takeLatest(fetchUserProfileRequest.type, fetchUserProfileSaga);
  yield takeLatest(logout.type, logoutSaga);
}
