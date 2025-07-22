import React from 'react';
import {
  Tooltip as RBTooltip,
  TooltipProps as RBTooltipProps,
} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Tooltip: React.FC<RBTooltipProps> = (props) => (
  <RBTooltip {...props} />
);
