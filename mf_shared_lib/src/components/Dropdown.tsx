import React from 'react';
import {
  Dropdown as RBDropdown,
  DropdownProps as RBDropdownProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type DropdownProps = Omit<RBDropdownProps, 'as'> & {as?: 'div'};

export const Dropdown: React.FC<DropdownProps> = (props) => (
  <RBDropdown {...props} />
);
