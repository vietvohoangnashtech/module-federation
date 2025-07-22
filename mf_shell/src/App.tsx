import './App.css';
import React, {Suspense} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store, createRootReducer} from 'mf_shared_lib/redux';
import {authReducer} from 'mf_user/authReducer';
import {rootSaga} from 'mf_user/rootSaga';

// Inject authReducer into the shared store
(store as any).asyncReducers.auth = authReducer;
(store as any).replaceReducer(createRootReducer((store as any).asyncReducers));

// Run rootSaga
(store as any).sagaMiddleware.run(rootSaga);

const LoginPage = React.lazy(() => import('mf_user/LoginPage'));
const SignupPage = React.lazy(() => import('mf_user/SignupPage'));

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
