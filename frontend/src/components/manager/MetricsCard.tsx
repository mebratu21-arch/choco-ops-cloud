import React, { useEffect, useState, useRef } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface MetricsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: 'success' | 'warning' | 'danger' | 'default';
  subtitle?: string;
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
  loading?: boolean;
  animate?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'default',
  subtitle,
  prefix = '',
  suffix = '',
  onClick,
  loading = false,
  animate = true,
}) => {
  // Sync displayValue immediately if not animating or loading
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef<number>(value);

  if (value !== prevValue) {
    setPrevValue(value);
    if (loading || !animate) {
      setDisplayValue(value);
    }
  }

  // Animated number counter
  useEffect(() => {
    if (loading || !animate) {
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    const animateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      } else {
        previousValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, loading, animate]);

  // Color mappings
  const colorMap = {
    success: {
      border: 'border-l-green-500',
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
    },
    warning: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      text: 'text-amber-600',
    },
    danger: {
      border: 'border-l-red-500',
      bg: 'bg-red-50',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600',
    },
    default: {
      border: 'border-l-cocoa-500',
      bg: 'bg-white',
      icon: 'bg-cocoa-100 text-cocoa-600',
      text: 'text-cocoa-600',
    },
  };

  const colors = colorMap[color];

  // Format number with commas
  const formatNumber = (num: number): string => {
    if (Number.isInteger(value)) {
      return Math.round(num).toLocaleString();
    }
    return num.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Trend icon and color
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 border-l-4",
        colors.border,
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        loading && "animate-pulse"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500 pr-2">
                {title}
              </p>
              <div className={cn(
                "p-2 rounded-lg transition-transform",
                colors.icon,
                onClick && "group-hover:scale-110"
              )}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Value with optional prefix/suffix */}
            <div className="flex items-baseline gap-1 mb-1">
              {prefix && (
                <span className="text-lg font-medium text-slate-400">{prefix}</span>
              )}
              <span className={cn(
                "text-3xl font-bold tracking-tight",
                colors.text
              )}>
                {formatNumber(displayValue)}
              </span>
              {suffix && (
                <span className="text-lg font-medium text-slate-400">{suffix}</span>
              )}
            </div>

            {/* Trend indicator */}
            {trend && trendValue !== undefined && (
              <div className={cn("flex items-center gap-1 mb-2", trendColor)}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}%
                </span>
                <span className="text-xs text-slate-400 ml-1">vs last period</span>
              </div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {subtitle}
              </p>
            )}

            {/* Hover indicator */}
            {onClick && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cocoa-300 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
