import React, {useState} from 'react';
import {useAppDispatch} from 'mf_shared_lib/redux';
import {Button, TextField} from 'mf_shared_lib/components';
import {loginRequest} from '../redux/auth/authSlice';
import {requestNavigation} from 'mf_shared_lib/navigationSlice';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginRequest({email, password}));
  };

  const handleSignup = () => {
    dispatch(requestNavigation({path: '/signup', replace: false}));
  };

  return (
    <div>
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <TextField
          label='Email'
          type='email'
          value={email}
          onChange={setEmail}
        />
        <TextField
          label='Password'
          type='password'
          value={password}
          onChange={setPassword}
        />
        <div className='d-flex justify-content-between mt-2'>
          <Button type='submit'>Login</Button>
          <Button type='button' onClick={handleSignup}>
            Sign up
          </Button>
        </div>
      </form>
    </div>
  );
};
