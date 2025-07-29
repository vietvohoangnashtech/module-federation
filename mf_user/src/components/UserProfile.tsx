import React, {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from 'mf_shared_lib/redux';
import {fetchUserProfileRequest} from '../redux/auth/authSlice';
import type {ExtendedRootState} from '../redux/store-types';
export const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: ExtendedRootState) => state.auth?.user);
  if (!user) {
    return null;
  }
  const profile = useAppSelector(
    (state: ExtendedRootState) => state.auth?.profile
  );
  const loading = useAppSelector(
    (state: ExtendedRootState) => state.auth?.loading
  );
  const error = useAppSelector((state: ExtendedRootState) => state.auth?.error);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfileRequest(user.id));
    }
  }, [dispatch, user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data.</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
};
