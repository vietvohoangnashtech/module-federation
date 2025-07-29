import {put, takeLatest, delay} from 'redux-saga/effects';
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

function* loginSaga(
  action: SagaAction<LoginPayload>
): Generator<any, void, any> {
  try {
    const {email, password} = action.payload;

    yield delay(1000);

    if (email && password) {
      const mockUser = {
        id: '12345',
        email: email,
        name: email.split('@')[0],
      };

      const mockSession = {
        access_token: 'mock-token',
        user: mockUser,
      };

      yield put(loginSuccess({user: mockUser, session: mockSession}));
      yield put(requestNavigation({path: '/', replace: false}));
    } else {
      yield put(loginFailure('Email and password are required'));
    }
  } catch (error: any) {
    yield put(loginFailure(error?.message || String(error)));
  }
}

function* logoutSaga(): Generator<any, void, any> {
  try {
    yield delay(500);

    yield put(logoutSuccess());
    yield put(requestNavigation({path: '/', replace: true}));
  } catch (error: any) {
    yield put(logoutFailure(error?.message || String(error)));
  }
}

function* signupSaga(
  action: SagaAction<SignupPayload>
): Generator<any, void, any> {
  try {
    const {email, password, ...rest} = action.payload;

    // Simulate API delay
    yield delay(1000);

    // Simple validation
    if (email && password) {
      // Create a simple mock user object for demo
      const mockUser = {
        id: '67890',
        email: email,
        name: rest.name || email.split('@')[0], // Use provided name or email prefix
      };

      const mockSession = {
        access_token: 'mock-token',
        user: mockUser,
      };

      yield put(signupSuccess({user: mockUser, session: mockSession}));
    } else {
      yield put(signupFailure('Email and password are required'));
    }
  } catch (error: any) {
    yield put(signupFailure(error?.message || String(error)));
  }
}

function* fetchUserProfileSaga(
  action: SagaAction<{id: string}>
): Generator<any, void, any> {
  try {
    console.log('fetchUserProfileSaga action:', action);
    const id = action.payload || '';

    // Simulate API delay
    yield delay(800);

    // Return mock profile data
    const mockProfile = {
      id: id,
      email: `user-${id}@example.com`,
      name: `User ${id}`,
      created_at: new Date().toISOString(),
    };

    yield put(fetchUserProfileSuccess(mockProfile));
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
