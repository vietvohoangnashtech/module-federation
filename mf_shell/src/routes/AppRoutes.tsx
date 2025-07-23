import React, {Suspense} from 'react';
import {Routes, Route} from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from 'src/pages/Home';

const Login = React.lazy(() => import('mf_user/Login'));
const Signup = React.lazy(() => import('mf_user/Signup'));
const UserProfilePage = React.lazy(() => import('mf_user/UserProfile'));

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRoutes;
