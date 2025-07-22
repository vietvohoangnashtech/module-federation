import React from 'react';
import {Modal as RBModal, ModalProps as RBModalProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Modal: React.FC<RBModalProps> = (props) => <RBModal {...props} />;
