import React from 'react';
import {Alert as RBAlert, AlertProps as RBAlertProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Alert: React.FC<RBAlertProps> = (props) => <RBAlert {...props} />;
