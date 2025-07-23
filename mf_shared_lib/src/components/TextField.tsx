import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult,
} from 'react-aria-components';

import './styles/TextField.scss';
export function TextField({
  label,
  description,
  errorMessage,
  ...props
}: AriaTextFieldProps & {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}) {
  return (
    <AriaTextField {...props}>
      <Label>{label}</Label>
      <Input />
      {description && <Text slot='description'>{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
