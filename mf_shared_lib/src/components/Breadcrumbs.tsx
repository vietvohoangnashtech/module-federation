import {
  Breadcrumbs as RACBreadcrumbs,
  BreadcrumbsProps,
} from 'react-aria-components';
import './styles/Breadcrumbs.scss';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}
