import React from 'react';
import {
  FormControl,
  FormControlProps as RBFormControlProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type InputProps = Omit<RBFormControlProps, 'as'> & {as?: 'input'};

export const Input: React.FC<InputProps> = (props) => (
  <FormControl {...props} />
);
