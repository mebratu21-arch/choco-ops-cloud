import React from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button'; // Adjusted import path

type EmptyStateVariant =
  | 'inventory'
  | 'batches'
  | 'qc'
  | 'search'
  | 'notifications'
  | 'generic';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
  variant?: EmptyStateVariant;
  className?: string;
}

const variantDefaults: Record<
  EmptyStateVariant,
  { title: string; description: string }
> = {
  inventory: {
    title: 'No inventory items yet',
    description: 'Start by adding your first raw material or packaging item.',
  },
  batches: {
    title: 'No production batches',
    description: 'Create a new batch to start tracking production.',
  },
  qc: {
    title: 'No QC checks recorded',
    description: 'Quality control results will appear here once inspections are logged.',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your filters or search term.',
  },
  notifications: {
    title: 'You’re all caught up',
    description: 'No new notifications at the moment.',
  },
  generic: {
    title: 'Nothing to show yet',
    description: 'Content will appear here once available.',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  illustration,
  variant = 'generic',
  className,
}) => {
  const defaults = variantDefaults[variant];

  return (
    <section
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        'px-4 py-10 sm:py-16',
        'bg-[#fdf8f6] rounded-2xl border border-[#f0e0d2]',
        'max-w-xl mx-auto',
        className,
      )}
      aria-label="Empty state"
    >
      <div className="mb-6 flex flex-col items-center gap-4">
        {illustration && (
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            {illustration}
          </div>
        )}

        {!illustration && icon && (
          <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-[#f3e7dd] text-[#C5A059]">
            {icon}
          </div>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#43302b] mb-2">
        {title ?? defaults.title}
      </h2>

      <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
        {description ?? defaults.description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#43302b] text-white hover:bg-[#2a1d1a] px-6 py-2 rounded-xl"
        >
          {actionLabel}
        </Button>
      )}
    </section>
  );
};

export default EmptyState;
