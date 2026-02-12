import React, { useState, FormEvent } from 'react';
import { Save, History } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useMechanic } from '../../hooks/useMechanic';
import { Machine } from '../../types';

export interface MaintenanceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId?: string;
  onSuccess?: () => void;
}

const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive', description: 'Scheduled maintenance' },
  { value: 'corrective', label: 'Corrective', description: 'Fix identified issues' },
  { value: 'emergency', label: 'Emergency', description: 'Urgent unplanned repair' },
];

const COMMON_PARTS = [
  'Belt', 'Motor', 'Sensor', 'Bearing', 'Seal', 'Valve',
  'Filter', 'Scraper', 'Heating Element', 'Cooling Fan'
];

const MaintenanceLogModal: React.FC<MaintenanceLogModalProps> = ({
  isOpen,
  onClose,
  machineId,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { useMachines, useCreateMaintenanceLog } = useMechanic();
  const { data: machines = [] } = useMachines();
  const createLogMutation = useCreateMaintenanceLog();

  const [formData, setFormData] = useState({
    machineId: machineId ?? '',
    maintenanceType: 'preventive' as 'preventive' | 'corrective' | 'emergency',
    description: '',
    partsReplaced: '',
    durationMinutes: '',
    cost: '',
  });

  const [validationError, setValidationError] = useState('');

  const handlePartToggle = (part: string) => {
    const currentParts = formData.partsReplaced
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    
    if (currentParts.includes(part)) {
      setFormData((prev) => ({
        ...prev,
        partsReplaced: currentParts.filter((p) => p !== part).join(', ')
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        partsReplaced: currentParts.length > 0 
          ? [...currentParts, part].join(', ')
          : part
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.machineId) {
      setValidationError('Please select a machine');
      return;
    }

    if (!formData.description.trim()) {
      setValidationError('Description is required');
      return;
    }

    const partsUsed = formData.partsReplaced
      ? formData.partsReplaced.split(',').map((p) => p.trim()).filter(Boolean).join(', ')
      : undefined;

    createLogMutation.mutate(
      {
        machine_id: formData.machineId,
        maintenance_type: formData.maintenanceType,
        description: formData.description,
        parts_used: partsUsed,
        duration_minutes: formData.durationMinutes ? parseInt(formData.durationMinutes, 10) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        date: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Maintenance Logged', {
            description: 'The maintenance record has been saved.',
          });
          setFormData({
            machineId: machineId ?? '',
            maintenanceType: 'preventive',
            description: '',
            partsReplaced: '',
            durationMinutes: '',
            cost: '',
          });
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          toast.error('Failed to log maintenance', {
            description: error.message || 'Please try again.',
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Maintenance" size="lg">
      <div className="space-y-6">
        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Machine Selector */}
          {!machineId && (
            <div>
              <label
                htmlFor="machineId"
                className="block text-sm font-medium text-chocolate-700 mb-2"
              >
                Select Machine <span className="text-red-500">*</span>
              </label>
              <select
                id="machineId"
                value={formData.machineId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, machineId: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-chocolate-500 focus:border-chocolate-500 sm:text-sm"
                disabled={createLogMutation.isPending}
                required
              >
                <option value="">Select a machine...</option>
                {machines.map((machine: Machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name} ({machine.machine_code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Maintenance Type */}
          <div>
            <label className="block text-sm font-medium text-chocolate-700 mb-2">
              Maintenance Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {MAINTENANCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      maintenanceType: type.value as 'preventive' | 'corrective' | 'emergency',
                    }))
                  }
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.maintenanceType === type.value
                      ? type.value === 'emergency'
                        ? 'bg-red-50 border-red-500'
                        : type.value === 'corrective'
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-green-50 border-green-500'
                      : 'bg-white border-chocolate-200 hover:border-chocolate-400'
                  }`}
                  disabled={createLogMutation.isPending}
                >
                  <span
                    className={`font-semibold text-sm ${
                      formData.maintenanceType === type.value
                        ? type.value === 'emergency'
                          ? 'text-red-700'
                          : type.value === 'corrective'
                          ? 'text-amber-700'
                          : 'text-green-700'
                        : 'text-chocolate-700'
                    }`}
                  >
                    {type.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-chocolate-700 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the maintenance work performed..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-chocolate-200 rounded-lg focus:ring-2 focus:ring-chocolate-500 focus:border-transparent transition-all resize-none text-chocolate-800"
              disabled={createLogMutation.isPending}
              required
            />
          </div>

          {/* Parts Replaced */}
          <div>
            <Input
              label="Parts Replaced (comma-separated, optional)"
              id="partsReplaced"
              type="text"
              placeholder="e.g., Belt, Motor, Sensor"
              value={formData.partsReplaced}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, partsReplaced: e.target.value }))
              }
              disabled={createLogMutation.isPending}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-wider text-chocolate-400 font-bold w-full mb-1">
                Quick Select
              </span>
              {COMMON_PARTS.map((part) => {
                const isSelected = formData.partsReplaced
                  .split(',')
                  .map((p) => p.trim())
                  .includes(part);
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => handlePartToggle(part)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-chocolate-500 text-white border-chocolate-600 shadow-sm'
                        : 'bg-white text-chocolate-600 border-chocolate-200 hover:border-chocolate-400'
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration and Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Duration (minutes)"
                id="durationMinutes"
                type="number"
                min="0"
                placeholder="e.g., 45"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))
                }
                disabled={createLogMutation.isPending}
              />
            </div>
            <div>
              <Input
                label="Cost (optional)"
                id="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 150.00"
                value={formData.cost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cost: e.target.value }))
                }
                disabled={createLogMutation.isPending}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onClose();
                navigate('/mechanic/history');
              }}
              className="text-chocolate-400 hover:text-chocolate-600 font-bold uppercase tracking-widest text-[10px] gap-2"
            >
              <History className="w-4 h-4" />
              All History
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createLogMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              isLoading={createLogMutation.isPending}
              disabled={createLogMutation.isPending}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Log
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MaintenanceLogModal;
