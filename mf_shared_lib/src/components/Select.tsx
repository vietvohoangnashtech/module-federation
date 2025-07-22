import React from 'react';
import {FormSelect, FormSelectProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Select: React.FC<FormSelectProps> = (props) => (
  <FormSelect {...props} />
);
