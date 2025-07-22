import {call, put, takeLatest, CallEffect, PutEffect} from 'redux-saga/effects';
import {supabase} from '../../supabase';
import * as actions from './actions';

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
    console.log(action, 'loginSaga', supabase.auth);
    const {data, error} = yield call([supabase.auth, 'signInWithPassword'], {
      email,
      password,
    });

    if (error) {
      yield put(actions.loginFailure(error.message || String(error)));
    } else {
      yield put(actions.loginSuccess(data));
    }
  } catch (error: any) {
    yield put(actions.loginFailure(error?.message || String(error)));
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
      yield put(actions.signupFailure(error.message || String(error)));
    } else {
      yield put(actions.signupSuccess(data));
    }
  } catch (error: any) {
    yield put(actions.signupFailure(error?.message || String(error)));
  }
}

export function* authSaga() {
  yield takeLatest(actions.loginRequest.type, loginSaga);
  yield takeLatest(actions.signupRequest.type, signupSaga);
}
