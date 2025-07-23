import {TextField} from '../src/components/TextField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Example = (args: any) => <TextField {...args} />;

Example.args = {
  label: 'Name',
};
