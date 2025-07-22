import React from 'react';
import {Card} from '../src/components/Card';
import {Card as RBCard} from 'react-bootstrap';

export default {
  title: 'Core/Card',
  component: Card,
};

export const Basic = () => (
  <Card style={{width: '18rem'}}>
    <RBCard.Body>
      <RBCard.Title>Card Title</RBCard.Title>
      <RBCard.Text>Some quick example text.</RBCard.Text>
    </RBCard.Body>
  </Card>
);
