import React from 'react';
import {Table} from '../src/components/Table';

export default {
  title: 'Core/Table',
  component: Table,
};

export const Basic = () => (
  <Table striped bordered hover>
    <thead>
      <tr>
        <th>#</th>
        <th>First Name</th>
        <th>Last Name</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>John</td>
        <td>Doe</td>
      </tr>
    </tbody>
  </Table>
);
