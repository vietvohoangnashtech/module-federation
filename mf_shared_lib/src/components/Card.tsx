import React from 'react';
import {Card as RBCard, CardProps as RBCardProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type CardProps = Omit<RBCardProps, 'as'> & {as?: 'div'};

export const Card: React.FC<CardProps> = (props) => <RBCard {...props} />;
