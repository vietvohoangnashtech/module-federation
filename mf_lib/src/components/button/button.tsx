import {ReactNode, ButtonHTMLAttributes} from 'react';
import './button.scss';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button = ({children, className, ...props}: ButtonProps) => {
  return (
    <button className={['btn', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </button>
  );
};

export default Button;
