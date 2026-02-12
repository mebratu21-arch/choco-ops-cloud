import React from 'react';
import { Clock, User, Wrench, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SOSAlert, AlertPriority, AlertStatus } from '../../types';

export interface SOSAlertCardProps {
  alert: SOSAlert;
  onRespond?: () => void;
  onResolve?: () => void;
  compact?: boolean;
}

const SOSAlertCard: React.FC<SOSAlertCardProps> = ({
  alert,
  onRespond,
  onResolve,
  compact = false,
}) => {
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const getPriorityConfig = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return {
          variant: 'error' as const,
          className: 'animate-pulse bg-red-600',
          borderColor: 'border-red-500',
          bgColor: 'bg-red-50',
        };
      case 'high':
        return {
          variant: 'error' as const,
          className: 'bg-red-500',
          borderColor: 'border-red-400',
          bgColor: 'bg-red-50',
        };
      case 'medium':
        return {
          variant: 'warning' as const,
          className: 'bg-amber-500',
          borderColor: 'border-amber-400',
          bgColor: 'bg-amber-50',
        };
      case 'low':
        return {
          variant: 'default' as const,
          className: 'bg-gray-400',
          borderColor: 'border-gray-300',
          bgColor: 'bg-gray-50',
        };
      default:
        return {
          variant: 'default' as const,
          className: 'bg-gray-400',
          borderColor: 'border-gray-300',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const getStatusVariant = (status: AlertStatus) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'assigned':
        return 'warning';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const priorityConfig = getPriorityConfig(alert.priority);

  if (compact) {
    return (
      <div
        className={`p-3 rounded-lg border-l-4 ${priorityConfig.borderColor} ${priorityConfig.bgColor} bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        onClick={onRespond}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={priorityConfig.variant} className="text-xs uppercase">
                {alert.priority}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(alert.reported_at)}
              </span>
            </div>
            <p className="font-medium text-chocolate-800 text-sm truncate">
              {alert.machine_name || 'Unknown Machine'}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {alert.problem_description}
            </p>
          </div>
          {alert.status === 'open' && onRespond && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-shrink-0 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                onRespond();
              }}
            >
              Respond
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border-2 ${priorityConfig.borderColor} ${priorityConfig.bgColor} shadow-sm hover:shadow-md transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${priorityConfig.className}`}>
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={priorityConfig.variant} className="uppercase text-xs">
                {alert.priority}
              </Badge>
              <Badge variant={getStatusVariant(alert.status) as any} className="text-xs">
                {alert.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(alert.reported_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Machine Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-4 h-4 text-chocolate-600" />
          <span className="font-semibold text-chocolate-800">
            {alert.machine_name || 'Unknown Machine'}
          </span>
          {alert.machine_code && (
            <span className="text-xs font-mono text-gray-500">
              ({alert.machine_code})
            </span>
          )}
        </div>
      </div>

      {/* Problem Description */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 line-clamp-2">
          {alert.problem_description}
        </p>
      </div>

      {/* Reporter Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          Reported by: {alert.reported_by_name || 'Unknown'}
        </span>
        {alert.assigned_to_name && (
          <span className="flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            Assigned: {alert.assigned_to_name}
          </span>
        )}
      </div>

      {/* Resolution Notes (if resolved) */}
      {alert.status === 'resolved' && alert.resolution_notes && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
          <p className="text-xs font-medium text-green-700 mb-1">Resolution Notes:</p>
          <p className="text-sm text-green-800">{alert.resolution_notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {alert.status === 'open' && onRespond && (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onRespond}
          >
            Assign to Me
          </Button>
        )}
        {(alert.status === 'assigned' || alert.status === 'in_progress') && onResolve && (
          <Button
            variant="success"
            size="sm"
            className="flex-1"
            onClick={onResolve}
          >
            Resolve
          </Button>
        )}
        {onRespond && alert.status !== 'open' && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onRespond}
          >
            View Details
          </Button>
        )}
      </div>
    </div>
  );
};

export default SOSAlertCard;
