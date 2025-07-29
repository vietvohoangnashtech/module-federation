import React from 'react';
import {Navigate} from 'react-router-dom';
import '../redux/store-types'; // Import type augmentations
import type {AuthState} from '../redux/store-types';
import {useSafeSliceSelector, useSliceAvailable} from 'mf_shared_lib/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
  // Check if auth slice is available
  const isAuthLoaded = useSliceAvailable('auth');

  // Use safe selector for user with fallback
  const user = useSafeSliceSelector(
    'auth',
    (auth: AuthState) => auth.user,
    null // fallback to null when auth slice not loaded
  );

  console.log('ProtectedRoute - Auth loaded:', isAuthLoaded, 'User:', user);

  // If auth slice isn't loaded yet, show loading or allow access
  // depending on your business logic
  if (!isAuthLoaded) {
    // You might want to show a loading spinner here instead
    return <Navigate to='/login' replace />;
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
