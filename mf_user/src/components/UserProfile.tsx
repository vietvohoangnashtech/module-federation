import React, {useEffect} from 'react';
import {useAppDispatch, useSafeSliceSelector} from 'mf_shared_lib/redux';
import {fetchUserProfileRequest} from '../redux/auth/authSlice';
import {shallowEqual} from 'react-redux';
import AuthState from '../redux/auth/types';
export const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();

  const {profile, loading, error, user} = useSafeSliceSelector(
    'auth',
    (state: AuthState) => ({
      profile: state.profile,
      loading: state.loading,
      error: state.error,
      user: state.user,
    }),
    {profile: null, loading: false, error: null, user: null},
    shallowEqual
  );

  if (!user) {
    return null;
  }

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
