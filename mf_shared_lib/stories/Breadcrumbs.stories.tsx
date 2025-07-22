import React from 'react';
import {Breadcrumbs} from '../src/components/Breadcrumbs';
import {Breadcrumb} from 'react-bootstrap';

export default {
  title: 'Core/Breadcrumbs',
  component: Breadcrumbs,
};

export const Basic = () => (
  <Breadcrumbs>
    <Breadcrumb.Item href='#'>Home</Breadcrumb.Item>
    <Breadcrumb.Item href='#'>Library</Breadcrumb.Item>
    <Breadcrumb.Item active>Data</Breadcrumb.Item>
  </Breadcrumbs>
);
