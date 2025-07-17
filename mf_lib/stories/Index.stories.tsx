import Button from '../src/components/button/button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Default = () => (
  <Button onClick={() => alert('Button clicked!')}>Click me</Button>
);
