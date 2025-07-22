import React from 'react';
import {
  Navbar as RBNavbar,
  NavbarProps as RBNavbarProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type NavbarProps = Omit<RBNavbarProps, 'as'> & {as?: 'nav'};

export const Navbar: React.FC<NavbarProps> = (props) => <RBNavbar {...props} />;
