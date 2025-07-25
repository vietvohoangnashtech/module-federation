export interface NavBarProps {
  children: React.ReactNode;
  className?: string;
}

export const NavigationBar = ({
  children,
  className,
  ...props
}: NavBarProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <nav className={`${className}`} {...props}>
      {children}
    </nav>
  );
};
