import React from 'react';
import {Badge as RBBadge, BadgeProps as RBBadgeProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

type BadgeProps = Omit<RBBadgeProps, 'as'> & {as?: 'span'};

export const Badge: React.FC<BadgeProps> = (props) => <RBBadge {...props} />;
