import React from 'react';
import {Dropdown} from '../src/components/Dropdown';
import {Dropdown as RBDropdown} from 'react-bootstrap';

export default {
  title: 'Core/Dropdown',
  component: Dropdown,
};

export const Basic = () => (
  <Dropdown>
    <RBDropdown.Toggle variant='success'>Dropdown</RBDropdown.Toggle>
    <RBDropdown.Menu>
      <RBDropdown.Item>Action</RBDropdown.Item>
      <RBDropdown.Item>Another action</RBDropdown.Item>
    </RBDropdown.Menu>
  </Dropdown>
);
