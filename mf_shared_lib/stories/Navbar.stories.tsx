import React from 'react';
import {Navbar} from '../src/components/Navbar';
import {Navbar as RBNavbar} from 'react-bootstrap';

export default {
  title: 'Core/Navbar',
  component: Navbar,
};

export const Basic = () => (
  <Navbar bg='light' expand='lg'>
    <RBNavbar.Brand href='#'>Brand</RBNavbar.Brand>
  </Navbar>
);
