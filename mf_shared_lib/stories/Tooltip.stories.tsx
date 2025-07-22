import React from 'react';
import {Tooltip} from '../src/components/Tooltip';

export default {
  title: 'Core/Tooltip',
  component: Tooltip,
};

export const Basic = () => <Tooltip id='tip'>Tooltip text</Tooltip>;
