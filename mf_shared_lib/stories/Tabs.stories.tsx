import React from 'react';
import {Tabs} from '../src/components/Tabs';
import {Tab} from 'react-bootstrap';

export default {
  title: 'Core/Tabs',
  component: Tabs,
};

export const Basic = () => (
  <Tabs defaultActiveKey='home' id='tab-example'>
    <Tab eventKey='home' title='Home'>
      Home content
    </Tab>
    <Tab eventKey='profile' title='Profile'>
      Profile content
    </Tab>
  </Tabs>
);
