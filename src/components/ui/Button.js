import React from 'react';

/**
 * Button component with different variants and sizes
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  // Define variant classes
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  // Define size classes
  const sizeClasses = {
    sm: 'h-9 px-3 rounded-md text-sm',
    md: 'h-10 px-4 py-2 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10 rounded-full',
  };

  // Base classes
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  // Combine classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button type={type} className={buttonClasses} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
