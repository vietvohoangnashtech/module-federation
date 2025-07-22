import React from 'react';
import {Alert} from '../src/components/Alert';

export default {
  title: 'Core/Alert',
  component: Alert,
};

export const Success = () => <Alert variant='success'>Success alert</Alert>;
export const Danger = () => <Alert variant='danger'>Danger alert</Alert>;
