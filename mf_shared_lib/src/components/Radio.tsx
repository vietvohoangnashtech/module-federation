import React from 'react';
import {FormCheck, FormCheckProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Radio: React.FC<FormCheckProps> = (props) => (
  <FormCheck type='radio' {...props} />
);
