import {
  ToggleButtonGroup as RACToggleButtonGroup,
  ToggleButtonGroupProps,
} from 'react-aria-components';
import './styles/ToggleButtonGroup.scss';

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return <RACToggleButtonGroup {...props} />;
}
