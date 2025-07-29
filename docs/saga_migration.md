# Saga Injection Migration Guide

This guide details the process of migrating from a shell-led saga injection pattern to a more robust, scalable, and decoupled feature-led dynamic injection pattern.

### Why Migrate?

The current approach, where `mf_shell` imports and runs sagas from each micro-frontend (MFE), creates tight coupling and a scalability bottleneck. The shell needs to know the internal implementation details of each MFE, and every new feature requires manual changes in the shell.

The target architecture makes each MFE a self-contained "black box" responsible for registering its own Redux reducers and sagas. This improves maintainability, enables true independent deployments, and aligns with core micro-frontend principles.

---

## Step 1: Enhance `mf_shared_lib` with Dynamic Managers

The foundation of this pattern is to give our shared Redux store the ability to have sagas and reducers added (and removed) at runtime.

### 1.1. Create a Reducer Manager

First, we need a way to inject reducers dynamically.

**Create `mf_shared_lib/src/redux/reducer-manager.ts`:**
```typescript
import { Reducer, combineReducers } from '@reduxjs/toolkit';
import store from './store';
import { createRootReducer } from './reducers';

export function injectReducer(key: string, reducer: Reducer) {
  // Prevent re-injection
  if (store.asyncReducers[key]) {
    return;
  }
  store.asyncReducers[key] = reducer;
  store.replaceReducer(createRootReducer(store.asyncReducers));
}
```

### 1.2. Create a Saga Manager

Next, we'''ll create a similar manager for our sagas.

**Create `mf_shared_lib/src/redux/saga-manager.ts`:**
```typescript
import { Task } from 'redux-saga';
import store from './store';

// Type guard to check if the property exists and is a Task
function isSagaTask(task: any): task is Task {
    return task && typeof task.cancel === 'function';
}

export function injectSaga(key: string, saga: () => Generator<any, void, any>) {
  // Prevent re-injection
  if (store.runningSagas && store.runningSagas[key]) {
    return;
  }
  const task = store.sagaMiddleware.run(saga);
  if (store.runningSagas) {
      store.runningSagas[key] = task;
  }
}

export function ejectSaga(key: string) {
  if (store.runningSagas && isSagaTask(store.runningSagas[key])) {
    store.runningSagas[key].cancel();
    delete store.runningSagas[key];
  }
}
```

### 1.3. Update the Shared Store

Now, update the main store to use these dynamic parts.

**Modify `mf_shared_lib/src/redux/store.ts`:**
```typescript
import { configureStore, Store } from '@reduxjs/toolkit';
import createSagaMiddleware, { Task } from 'redux-saga';
import { createRootReducer } from './reducers';

const sagaMiddleware = createSagaMiddleware();

// Define the shape of our extended store
export interface ExtendedStore extends Store {
  asyncReducers: Record<string, any>;
  sagaMiddleware: typeof sagaMiddleware;
  runningSagas: Record<string, Task>;
}

const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
}) as ExtendedStore;

// Attach the dynamic managers to the store instance
store.asyncReducers = {};
store.runningSagas = {};
store.sagaMiddleware = sagaMiddleware;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
```

### 1.4. Expose the Managers

Make sure to export the new injection functions from the `mf_shared_lib`'''s main entry point (`index.ts` or `index.tsx`) so other MFEs can use them.

**In `mf_shared_lib/src/redux/index.ts`:**
```typescript
export * from './hooks';
export * from './store';
export * from './types';
export * from './reducer-manager';
export * from './saga-manager';
// ... other exports
```

---

## Step 2: Refactor `mf_user` to be Self-Initializing

Now, `mf_user` will become responsible for its own setup.

### 2.1. Create an `initialize` Function

This function will contain all the logic needed to get the feature running.

**Create `mf_user/src/bootstrap.ts`:**
```typescript
import { injectSaga } from 'mf_shared_lib/redux/saga-manager';
import { injectReducer } from 'mf_shared_lib/redux/reducer-manager';
import { authSaga } from './redux/auth/saga';
import authReducer from './redux/auth/authSlice';

const FEATURE_KEY = 'auth';
let isInitialized = false;

export const initializeUserFeature = () => {
  // This idempotency check ensures the logic runs only once.
  if (isInitialized) {
    return;
  }

  console.log('Initializing User Feature: Injecting reducer and saga.');
  injectReducer(FEATURE_KEY, authReducer);
  injectSaga(FEATURE_KEY, authSaga);

  isInitialized = true;
};
```

### 2.2. Update Module Federation Config

Expose the new `initializeUserFeature` function from `mf_user`'''s federation config and remove the direct exposure of the saga file.

**In `mf_user/module-federation.config.ts`:**
```typescript
// ...
exposes: {
  // './Login': './src/components/Login', // Keep exposing components
  // './UserProfile': './src/components/UserProfile',
  './bootstrap': './src/bootstrap', // Expose the new initializer
  // REMOVE './authSaga': './src/redux/auth/saga',
},
// ...
```

---

## Step 3: Simplify `mf_shell`

Finally, update the shell to use this new, cleaner approach.

### 3.1. Call the Initializer at Startup

In the shell'''s main entry point, call the `initializeUserFeature` function once.

**In `mf_shell/src/bootstrap.tsx` (or `App.tsx`):**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeUserFeature } from 'mf_user/bootstrap';

// --- KEY CHANGE ---
// Initialize the user feature before the application renders.
// This ensures the auth slice and saga are ready.
initializeUserFeature();
// ------------------

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.2. Remove Old Saga Injection Code

Delete any code from the shell that was previously importing `authSaga` from `mf_user` and running it with `sagaMiddleware.run()`. This logic is now owned by `mf_user`.

---

## Conclusion

By following these steps, you have successfully refactored your application to a more scalable and maintainable architecture.

-   **Decoupled:** The shell no longer needs to know about the internal Redux structure of `mf_user`.
-   **Scalable:** Adding a new `mf_cart` feature with its own sagas will require zero changes to the shell'''s initialization logic.
-   **Robust:** Each feature manages its own lifecycle, reducing the chance of errors and making the codebase easier to reason about.
