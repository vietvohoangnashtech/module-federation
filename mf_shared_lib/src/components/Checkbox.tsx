import React from 'react';
import {FormCheck, FormCheckProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Checkbox: React.FC<FormCheckProps> = (props) => (
  <FormCheck type='checkbox' {...props} />
);
