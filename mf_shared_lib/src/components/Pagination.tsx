import React from 'react';
import {
  Pagination as RBPagination,
  PaginationProps as RBPaginationProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Pagination: React.FC<RBPaginationProps> = (props) => (
  <RBPagination {...props} />
);
