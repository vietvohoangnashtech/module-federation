import {
  ToggleButton as RACToggleButton,
  ToggleButtonProps,
} from 'react-aria-components';
import './styles/ToggleButton.scss';

export function ToggleButton(props: ToggleButtonProps) {
  return <RACToggleButton {...props} />;
}
