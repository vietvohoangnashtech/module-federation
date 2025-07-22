import React from 'react';
import {
  Breadcrumb,
  BreadcrumbProps as RBBreadcrumbProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type BreadcrumbsProps = Omit<RBBreadcrumbProps, 'as'> & {as?: 'nav'};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = (props) => (
  <Breadcrumb {...props} />
);
