import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {loginRequest} from '../redux/auth';
import {Button, Card, Input} from 'mf_shared_lib/components';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email, password);
    dispatch(loginRequest({email, password}));
  };

  return (
    <Card className='m-4'>
      <form onSubmit={handleSubmit}>
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
        <Button type='submit'>Login</Button>
      </form>
    </Card>
  );
};

export default LoginPage;
