import React from 'react';
import {
  Spinner as RBSpinner,
  SpinnerProps as RBSpinnerProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type SpinnerProps = Omit<RBSpinnerProps, 'as'> & {as?: 'div'};

export const Spinner: React.FC<SpinnerProps> = (props) => (
  <RBSpinner {...props} />
);
