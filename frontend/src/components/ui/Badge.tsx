import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-slate-300",
        // Status variants for CocoaFlow
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        error:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        // Production status badges
        pending:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        in_progress:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        completed:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        cancelled:
          "border-transparent bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
        // QC result badges
        pass:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        fail:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        hold:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        // Inventory/Stock badges
        low_stock:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        in_stock:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        out_of_stock:
          "border-transparent bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
        // Priority badges
        critical:
          "border-transparent bg-red-600 text-white",
        high:
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        medium:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        low:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon
  dot?: boolean
}

function Badge({ className, variant, size, icon: Icon, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </div>
  )
}

// Helper function to get badge variant from status string
type StatusVariant = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'pass' | 'fail' | 'hold' | 'success' | 'warning' | 'error' | 'info';

function getStatusVariant(status: string): StatusVariant {
  const statusMap: Record<string, StatusVariant> = {
    pending: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
    pass: 'pass',
    fail: 'fail',
    hold: 'hold',
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    active: 'success',
    inactive: 'pending',
    approved: 'success',
    rejected: 'error',
  };
  return statusMap[status.toLowerCase()] || 'pending';
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants, getStatusVariant }
