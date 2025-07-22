import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {signupRequest} from '../redux/auth';
import {Button, Card, Input} from 'mf_shared_lib/components';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const dispatch = useDispatch();

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
    <Card className='m-4'>
      <form onSubmit={handleSubmit}>
        <Input
          label='First Name'
          type='text'
          value={firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
        />
        <Input
          label='Last Name'
          type='text'
          value={lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
        />
        <Input
          label='Phone Number'
          type='text'
          value={phoneNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPhoneNumber(e.target.value)
          }
        />
        <Input
          label='Birthday'
          type='date'
          value={birthday}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBirthday(e.target.value)
          }
        />
        <Input
          label='Email'
          type='email'
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <Input
          label='Password'
          type='password'
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
        <Button type='submit'>Sign Up</Button>
      </form>
    </Card>
  );
};

export default SignupPage;
