import {Provider} from 'react-redux';
import {store} from 'mf_shared_lib/redux';
import './App.css';

const App = ({children}: {children?: React.ReactNode}) => {
  return <Provider store={store}>{children}</Provider>;
};

export default App;
