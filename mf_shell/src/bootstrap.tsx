import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {applyTheme} from './theme/applyTheme';
import {initializeUserFeature} from 'mf_user/bootstrap';
import {initializeCartFeature} from 'mf_cart/bootstrap';
import {initializeProductFeature} from 'mf_products/bootstrap';

initializeUserFeature();
initializeCartFeature();
initializeProductFeature();

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
