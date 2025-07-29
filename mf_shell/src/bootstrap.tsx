import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {applyTheme} from './theme/applyTheme';
import { initializeUserFeature } from 'mf_user/bootstrap';

// Initialize the user feature before the application renders.
// This ensures the auth slice and saga are ready.
initializeUserFeature();

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
