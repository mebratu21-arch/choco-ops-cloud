import React, { useState } from 'react';
import {
  Package,
  Play,
  CheckCircle2,
  ClipboardCheck,
  AlertTriangle,
  Megaphone,
  ListTodo,
  User,
  ChevronDown,
  Clock,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

// Activity types
type ActivityType =
  | 'batch_started'
  | 'batch_completed'
  | 'batch_failed'
  | 'qc_completed'
  | 'qc_rejected'
  | 'stock_updated'
  | 'sos_alert'
  | 'task_completed'
  | 'task_assigned'
  | 'announcement'
  | 'user_login'
  | 'system';

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
  maxVisible?: number;
  onActivityClick?: (activity: Activity) => void;
}

// Activity type configuration
const activityConfig: Record<ActivityType, {
  icon: typeof Package;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  batch_started: {
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  batch_completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  batch_failed: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  qc_completed: {
    icon: ClipboardCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
  },
  qc_rejected: {
    icon: ClipboardCheck,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  stock_updated: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  sos_alert: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  task_completed: {
    icon: ListTodo,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
  },
  task_assigned: {
    icon: ListTodo,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
  },
  announcement: {
    icon: Megaphone,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
  },
  user_login: {
    icon: User,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
  },
  system: {
    icon: Activity,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
  },
};

// Format relative time
const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  loading = false,
  maxVisible = 10,
  onActivityClick,
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activities : activities.slice(0, maxVisible);
  const hasMore = activities.length > maxVisible;

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No recent activity</p>
        <p className="text-slate-400 text-sm mt-1">
          Activities will appear here as they happen
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

      {/* Activities list */}
      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
        {displayedActivities.map((activity, index) => {
          const config = activityConfig[activity.type] || activityConfig.system;
          const Icon = config.icon;
          const isUrgent = activity.type === 'sos_alert' || activity.type === 'batch_failed';

          return (
            <div
              key={activity.id}
              className={cn(
                "relative flex gap-3 py-3 px-2 rounded-lg transition-colors cursor-pointer",
                "hover:bg-slate-50",
                isUrgent && "bg-red-50/50 hover:bg-red-50"
              )}
              onClick={() => onActivityClick?.(activity)}
            >
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-white",
                  config.bgColor,
                  config.borderColor,
                  isUrgent && "animate-pulse"
                )}
              >
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm text-slate-700 leading-snug",
                  isUrgent && "font-medium text-red-700"
                )}>
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {activity.user}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>

              {/* New indicator for recent activities */}
              {index < 2 && (
                <span className="absolute top-3 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Load More button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="gap-2 text-cocoa-600 hover:text-cocoa-700"
          >
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              showAll && "rotate-180"
            )} />
            {showAll ? 'Show Less' : `Show ${activities.length - maxVisible} More`}
          </Button>
        </div>
      )}

      {/* Auto-scroll indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default ActivityTimeline;
