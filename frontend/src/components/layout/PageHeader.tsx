import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  icon?: LucideIcon;
  badge?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  icon: Icon,
  badge,
  className
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from path if not provided
  const autoBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;

    const pathParts = location.pathname.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [{ label: 'Home', href: '/dashboard', icon: Home }];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === pathParts.length - 1;
      const label = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      crumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return crumbs.length > 1 ? crumbs : undefined;
  }, [breadcrumbs, location.pathname]);

  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      {/* Breadcrumbs */}
      {autoBreadcrumbs && autoBreadcrumbs.length > 1 && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center flex-wrap gap-1 text-sm">
            {autoBreadcrumbs.map((crumb, index) => {
              const isLast = index === autoBreadcrumbs.length - 1;
              const CrumbIcon = crumb.icon;

              return (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      to={crumb.href}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-cocoa-600 transition-colors"
                    >
                      {CrumbIcon && <CrumbIcon className="w-3.5 h-3.5" />}
                      <span>{crumb.label}</span>
                    </Link>
                  ) : (
                    <span className={cn(
                      "flex items-center gap-1.5",
                      isLast ? "text-cocoa-700 font-medium" : "text-slate-500"
                    )}>
                      {CrumbIcon && <CrumbIcon className="w-3.5 h-3.5" />}
                      <span>{crumb.label}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {Icon && (
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cocoa-100 to-cocoa-50 text-cocoa-600 shadow-sm">
              <Icon className="w-6 h-6" />
            </div>
          )}

          <div>
            {/* Title with optional badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-cocoa-900 tracking-tight">
                {title}
              </h1>
              {badge}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-slate-500 mt-1.5 text-sm md:text-base max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact header variant for detail pages
export const PageHeaderCompact: React.FC<{
  title: string;
  backLink?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}> = ({ title, backLink, backLabel = 'Back', actions }) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {backLink && (
          <Link
            to={backLink}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-cocoa-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-cocoa-900">{title}</h1>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
