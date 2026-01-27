import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-white hover:bg-gold-dark shadow-sm',
  secondary: 'bg-white border border-border text-cocoa hover:bg-secondary-50', // Fixed parchment color ref
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent hover:bg-gold/10 text-gold'
};

export default function Button({
  children,
  variant = 'secondary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-gold/50',
        'disabled:opacity-50 disabled:cursor-not-allowed', // Keeping the accessibility feature
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
