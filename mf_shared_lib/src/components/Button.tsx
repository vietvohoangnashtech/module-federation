import React from 'react';
import {
  Button as RBButton,
  ButtonProps as RBButtonProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type ButtonProps = Omit<RBButtonProps, 'as'> & {as?: 'button'};

export const Button: React.FC<ButtonProps> = (props) => {
  return <RBButton {...props} />;
};
