import React from 'react';
import {Badge} from '../src/components/Badge';

export default {
  title: 'Core/Badge',
  component: Badge,
};

export const Primary = () => <Badge bg='primary'>Primary</Badge>;
export const Success = () => <Badge bg='success'>Success</Badge>;
