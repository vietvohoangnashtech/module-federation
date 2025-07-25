import {Routes, Route} from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from 'src/pages/Home';
import {LoadingSpinner} from 'src/components/LoadingSpinner';
import {Signup} from 'mf_user/components';
import {UserProfile} from 'mf_user/components';
import {Suspense} from 'react';

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/signup' element={<Signup />} />
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRoutes;
