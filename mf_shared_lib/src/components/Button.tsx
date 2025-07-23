import {Button as RACButton, ButtonProps} from 'react-aria-components';
import './styles/Button.scss';

export function Button(props: ButtonProps) {
  return <RACButton {...props} />;
}
