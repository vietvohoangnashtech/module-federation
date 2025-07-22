import React, {useState} from 'react';
import {Modal} from '../src/components/Modal';
import {Button} from '../src/components/Button';
import {Modal as RBModal} from 'react-bootstrap';

export default {
  title: 'Core/Modal',
  component: Modal,
};

export const Basic = () => {
  const [show, setShow] = useState(false);
  return (
    <>
      <Button onClick={() => setShow(true)}>Open Modal</Button>
      <Modal show={show} onHide={() => setShow(false)}>
        <RBModal.Header closeButton>
          <RBModal.Title>Modal Title</RBModal.Title>
        </RBModal.Header>
        <RBModal.Body>Modal body content</RBModal.Body>
        <RBModal.Footer>
          <Button variant='secondary' onClick={() => setShow(false)}>
            Close
          </Button>
        </RBModal.Footer>
      </Modal>
    </>
  );
};
