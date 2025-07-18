import React from 'react';
import './App.scss';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

const Home = () => <div className='intro'>Welcome to React Webpack App!</div>;

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
    </Routes>
  </BrowserRouter>
);

export default App;
