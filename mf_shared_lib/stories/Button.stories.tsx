import React from 'react';
import {Button} from '../src/components/Button';

export default {
  title: 'Core/Button',
  component: Button,
};

export const Primary = () => <Button variant='primary'>Primary</Button>;
export const Secondary = () => <Button variant='secondary'>Secondary</Button>;
