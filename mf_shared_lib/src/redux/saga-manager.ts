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
