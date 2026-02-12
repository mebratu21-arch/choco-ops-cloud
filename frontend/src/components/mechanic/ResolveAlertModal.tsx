import React, { useState, FormEvent } from 'react';
import { AlertTriangle, Clock, Wrench, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useMechanic } from '../../hooks/useMechanic';
import { SOSAlert } from '../../types';

export interface ResolveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: SOSAlert;
  onResolved?: () => void;
}

const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({
  isOpen,
  onClose,
  alert,
  onResolved,
}) => {
  const { useResolveAlert } = useMechanic();
  const resolveAlertMutation = useResolveAlert();

  const [formData, setFormData] = useState({
    resolutionNotes: '',
    partsUsed: '',
    timeSpent: '',
  });

  const [validationError, setValidationError] = useState('');

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    if (diffMins > 0) return `${diffMins} minutes ago`;
    return 'Just now';
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.resolutionNotes.trim()) {
      setValidationError('Resolution notes are required');
      return;
    }

    resolveAlertMutation.mutate(
      {
        id: alert.id,
        notes: formData.resolutionNotes,
      },
      {
        onSuccess: () => {
          toast.success('Alert Resolved', {
            description: 'The SOS alert has been marked as resolved.',
          });
          setFormData({
            resolutionNotes: '',
            partsUsed: '',
            timeSpent: '',
          });
          onResolved?.();
          onClose();
        },
        onError: (error) => {
          toast.error('Failed to resolve alert', {
            description: error.message || 'Please try again.',
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve SOS Alert" size="lg">
      <div className="space-y-6">
        {/* Alert Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getPriorityVariant(alert.priority)} className="uppercase text-xs">
                  {alert.priority}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(alert.reported_at)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-chocolate-600" />
                <span className="font-semibold text-chocolate-800">
                  {alert.machine_name ?? 'Unknown Machine'}
                </span>
                {alert.machine_code && (
                  <span className="text-xs font-mono text-gray-500">
                    ({alert.machine_code})
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-2">
                {alert.problem_description}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                Reported by: {alert.reported_by_name ?? 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {validationError}
          </div>
        )}

        {/* Resolution Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resolution Notes */}
          <div>
            <label
              htmlFor="resolutionNotes"
              className="block text-sm font-medium text-chocolate-700 mb-2"
            >
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="resolutionNotes"
              rows={4}
              placeholder="Describe what was done to resolve the issue..."
              value={formData.resolutionNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, resolutionNotes: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-chocolate-200 rounded-lg focus:ring-2 focus:ring-chocolate-500 focus:border-transparent transition-all resize-none text-chocolate-800"
              disabled={resolveAlertMutation.isPending}
              required
            />
          </div>

          {/* Parts Used */}
          <div>
            <Input
              label="Parts Used (optional)"
              id="partsUsed"
              type="text"
              placeholder="e.g., Belt, Motor, Sensor..."
              value={formData.partsUsed}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, partsUsed: e.target.value }))
              }
              disabled={resolveAlertMutation.isPending}
            />
          </div>

          {/* Time Spent */}
          <div>
            <Input
              label="Time Spent (minutes, optional)"
              id="timeSpent"
              type="number"
              min="0"
              placeholder="e.g., 45"
              value={formData.timeSpent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timeSpent: e.target.value }))
              }
              disabled={resolveAlertMutation.isPending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={resolveAlertMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={resolveAlertMutation.isPending}
              disabled={resolveAlertMutation.isPending}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Resolved
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ResolveAlertModal;
