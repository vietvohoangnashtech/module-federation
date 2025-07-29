import './App.scss';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from 'mf_shared_lib/redux';
import NavigationHandler from './components/NavigationHandler';
import AppRoutes from './routes/AppRoutes';

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
