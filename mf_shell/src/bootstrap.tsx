import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {applyTheme} from './theme/applyTheme';
import {initializeUserFeature} from 'mf_user/bootstrap';
import {initializeCartFeature} from 'mf_cart/bootstrap';

initializeUserFeature();
initializeCartFeature();

applyTheme();

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
