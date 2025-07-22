import React from 'react';
import {FormControl, FormControlProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Textarea: React.FC<FormControlProps> = (props) => (
  <FormControl as='textarea' {...props} />
);
