import * as React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, Package, FileQuestion, Search, AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'no-data' | 'no-results';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: EmptyStateVariant;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  'no-data': Package,
  'no-results': FileQuestion,
};

const variantColors: Record<EmptyStateVariant, string> = {
  default: 'text-slate-400',
  search: 'text-blue-400',
  error: 'text-red-400',
  'no-data': 'text-amber-400',
  'no-results': 'text-slate-400',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  variant = 'default',
  action,
  secondaryAction,
  className,
  children,
}) => {
  const Icon = icon || variantIcons[variant];
  const iconColor = variantColors[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800',
          variant === 'error' && 'bg-red-50 dark:bg-red-900/20'
        )}
      >
        <Icon className={cn('h-8 w-8', iconColor)} />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              leftIcon={action.icon}
              variant="default"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized empty states for common use cases
export const NoSearchResults: React.FC<{
  query?: string;
  onClear?: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={
      query
        ? `We couldn't find any results for "${query}". Try adjusting your search or filters.`
        : 'Try adjusting your search or filters to find what you\'re looking for.'
    }
    action={
      onClear
        ? {
            label: 'Clear search',
            onClick: onClear,
          }
        : undefined
    }
  />
);

export const NoInventoryItems: React.FC<{
  onAddItem?: () => void;
}> = ({ onAddItem }) => (
  <EmptyState
    variant="no-data"
    icon={Package}
    title="No inventory items"
    description="Your inventory is empty. Add items to start tracking your chocolate ingredients and supplies."
    action={
      onAddItem
        ? {
            label: 'Add First Item',
            onClick: onAddItem,
          }
        : undefined
    }
  />
);

export const NoBatches: React.FC<{
  onCreateBatch?: () => void;
}> = ({ onCreateBatch }) => (
  <EmptyState
    variant="no-data"
    title="No production batches"
    description="Start a new production batch to begin manufacturing your delicious chocolates."
    action={
      onCreateBatch
        ? {
            label: 'Start New Batch',
            onClick: onCreateBatch,
          }
        : undefined
    }
  />
);

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description={message || 'An unexpected error occurred. Please try again later.'}
    action={
      onRetry
        ? {
            label: 'Try Again',
            onClick: onRetry,
          }
        : undefined
    }
  />
);

export default EmptyState;
