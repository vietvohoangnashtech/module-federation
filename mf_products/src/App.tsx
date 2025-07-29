import './App.css';
import {Provider} from 'react-redux';
import {store} from 'mf_shared_lib/redux';
const App = ({children}: {children: React.ReactNode}) => {
  return <Provider store={store}>{children}</Provider>;
};

export default App;
