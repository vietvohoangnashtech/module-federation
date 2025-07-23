import {Dialog as RACDialog, DialogProps} from 'react-aria-components';
import './styles/Dialog.scss';

export function Dialog(props: DialogProps) {
  return <RACDialog {...props} />;
}
