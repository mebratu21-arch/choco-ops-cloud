import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:ps-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950',
  {
    variants: {
      variant: {
        default: 'bg-white text-slate-950 border-slate-200',
        success: 'bg-green-50 text-green-900 border-green-200 [&>svg]:text-green-600',
        warning: 'bg-amber-50 text-amber-900 border-amber-200 [&>svg]:text-amber-600',
        error: 'bg-red-50 text-red-900 border-red-200 [&>svg]:text-red-600',
        info: 'bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = {
      default: Info,
      success: CheckCircle2,
      warning: AlertTriangle,
      error: AlertCircle,
      info: Info,
    }[variant || 'default'];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="absolute top-3 end-3 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
