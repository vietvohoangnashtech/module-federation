import React from 'react';
import {Select} from '../src/components/Select';

export default {
  title: 'Core/Select',
  component: Select,
};

export const Basic = () => (
  <Select>
    <option>Option 1</option>
    <option>Option 2</option>
  </Select>
);
