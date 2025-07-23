import {Link as RACLink, LinkProps} from 'react-aria-components';
import './styles/Link.scss';

export function Link(props: LinkProps) {
  return <RACLink {...props} />;
}
