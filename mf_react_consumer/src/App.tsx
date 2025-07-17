import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';
import Provider from 'provider';
const App = () => {
  return (
    <BrowserRouter>
      <div className='content'>
        <Routes>
          <Route path='/' element={<div>Welcome to the Host App!</div>} />
          <Route path='/provider/*' element={<Provider />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
