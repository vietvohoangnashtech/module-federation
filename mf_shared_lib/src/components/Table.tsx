import React from 'react';
import {Table as RBTable, TableProps as RBTableProps} from 'react-bootstrap';
import '../theme/custom-bootstrap.scss';

export const Table: React.FC<RBTableProps> = (props) => <RBTable {...props} />;
