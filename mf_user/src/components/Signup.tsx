import React, {useState} from 'react';
import {useAppDispatch} from 'mf_shared_lib/redux';
import {Button, TextField} from 'mf_shared_lib/components';
import {requestNavigation} from 'mf_shared_lib/navigationSlice';
import {signupRequest} from '../redux/auth/authSlice';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      signupRequest({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        birthday,
      })
    );
  };

  return (
    <div className='m-4'>
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <TextField
          label='First Name'
          type='text'
          value={firstName}
          onChange={setFirstName}
        />
        <TextField
          label='Last Name'
          type='text'
          value={lastName}
          onChange={setLastName}
        />
        <TextField
          label='Phone Number'
          type='text'
          value={phoneNumber}
          onChange={setPhoneNumber}
        />
        <TextField
          label='Birthday'
          type='date'
          value={birthday}
          onChange={setBirthday}
        />
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
        <Button type='submit'>Sign Up</Button>
        <Button
          type='button'
          onClick={() =>
            dispatch(requestNavigation({path: '/login', replace: false}))
          }
        >
          Back
        </Button>
      </form>
    </div>
  );
};

export default Signup;
