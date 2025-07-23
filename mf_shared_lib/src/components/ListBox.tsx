import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxItemProps,
  ListBoxProps,
} from 'react-aria-components';

import './styles/ListBox.scss';

export function ListBox<T extends object>({
  children,
  ...props
}: ListBoxProps<T>) {
  return <AriaListBox {...props}>{children}</AriaListBox>;
}

export function ListBoxItem(props: ListBoxItemProps) {
  return <AriaListBoxItem {...props} />;
}
