import './App.css';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store, createRootReducer} from 'mf_shared_lib/redux';
import authReducer from 'mf_user/authSlice';
import {authSaga} from 'mf_user/authSaga';
import NavigationHandler from './components/NavigationHandler';
import AppRoutes from './routes/AppRoutes';

(store as any).asyncReducers.auth = authReducer;
(store as any).replaceReducer(createRootReducer((store as any).asyncReducers));
(store as any).sagaMiddleware.run(authSaga);

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <NavigationHandler />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
