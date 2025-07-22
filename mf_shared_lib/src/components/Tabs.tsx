import React from 'react';
import {Tabs as RBTabs, TabsProps as RBTabsProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Tabs: React.FC<RBTabsProps> = (props) => <RBTabs {...props} />;
