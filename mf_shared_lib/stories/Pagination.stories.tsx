import React from 'react';
import {Pagination} from '../src/components/Pagination';
import {Pagination as RBPagination} from 'react-bootstrap';

export default {
  title: 'Core/Pagination',
  component: Pagination,
};

export const Basic = () => (
  <Pagination>
    <RBPagination.Item>1</RBPagination.Item>
    <RBPagination.Item>2</RBPagination.Item>
    <RBPagination.Item>3</RBPagination.Item>
  </Pagination>
);
