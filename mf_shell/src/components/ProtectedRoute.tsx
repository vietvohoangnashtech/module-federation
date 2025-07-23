import React from 'react';
import {useAppSelector} from 'mf_shared_lib/redux';
import {Navigate} from 'react-router-dom';

// Adjust selector based on your store structure
const selectUser = (state: any) => state.auth?.user;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
  const user = useAppSelector(selectUser);
  console.log('ProtectedRoute user:', user); // Debugging line to check user state
  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
