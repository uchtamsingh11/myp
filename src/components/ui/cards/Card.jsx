import React from 'react';

/**
 * Card component with optional header, content, and footer
 */
export function Card({ className = '', ...props }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    />
  );
}

/**
 * Card header component
 */
Card.Header = function CardHeader({ className = '', ...props }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
};

/**
 * Card title component
 */
Card.Title = function CardTitle({ className = '', ...props }) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
  );
};

/**
 * Card description component
 */
Card.Description = function CardDescription({ className = '', ...props }) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
};

/**
 * Card content component
 */
Card.Content = function CardContent({ className = '', ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
};

/**
 * Card footer component
 */
Card.Footer = function CardFooter({ className = '', ...props }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />;
};
