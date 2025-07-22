import React from 'react';
import './App.scss';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
const Button = React.lazy(() => import('mf_shared_lib/components/Button'));

const Home = () => (
  <div className='intro'>
    Welcome to React Webpack App!
    <React.Suspense fallback={<span>Loading...</span>}>
      <Button>Test</Button>
    </React.Suspense>
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
    </Routes>
  </BrowserRouter>
);

export default App;
