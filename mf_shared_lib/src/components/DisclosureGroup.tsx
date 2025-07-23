import {
  DisclosureGroup as RACDisclosureGroup,
  DisclosureGroupProps,
} from 'react-aria-components';
import './styles/DisclosureGroup.scss';

export function DisclosureGroup(props: DisclosureGroupProps) {
  return <RACDisclosureGroup {...props} />;
}
