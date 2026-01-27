import clsx from 'clsx';
import * as React from 'react';

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  icon?: React.ReactNode;
}

export default function Input({
  className,
  hasError,
  icon,
  ...props
}: InputProps) {
  return (
    <div className="relative w-full group">
      {icon && (
        <div className="absolute inset-y-0 start-3 flex items-center text-muted-foreground group-focus-within:text-gold transition-colors">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={clsx(
          'w-full py-2 border rounded-lg transition-all focus:outline-none',
          'bg-white dark:bg-gray-800',
          icon ? 'ps-10 pe-4' : 'px-4', // RTL-safe padding
          hasError 
            ? 'border-red-500 focus:ring-red-500/20' 
            : 'border-border focus:ring-2 focus:ring-gold/30 focus:border-gold',
          className
        )}
      />
    </div>
  );
}
