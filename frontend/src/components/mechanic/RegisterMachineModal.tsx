import React, { useState, FormEvent } from 'react';
import { Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useMechanic } from '../../hooks/useMechanic';
import { MachineStatus } from '../../types';

interface RegisterMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MACHINE_TYPES = [
  'Grinder', 'Mixer', 'Cooler', 'Packaging Machine', 'Roaster', 'Separator', 'Refiner', 'Conch', 'Melanger'
];

const RegisterMachineModal: React.FC<RegisterMachineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { useCreateMachine } = useMechanic();
  const createMachineMutation = useCreateMachine();

  const [formData, setFormData] = useState({
    name: '',
    machine_code: '',
    type: 'Grinder',
    location: '',
    status: 'operational' as MachineStatus,
    notes: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim() || !formData.machine_code.trim()) {
      setValidationError('Name and Machine Code are required');
      return;
    }

    createMachineMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Machine Registered', {
          description: `${formData.name} has been added to the factory.`,
        });
        setFormData({
          name: '',
          machine_code: '',
          type: 'Grinder',
          location: '',
          status: 'operational',
          notes: '',
        });
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error('Registration Failed', {
          description: error.message || 'Please try again.',
        });
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Machine" size="lg">
      <div className="space-y-6">
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Machine Name"
              id="name"
              placeholder="e.g., Mixing Unit 5"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Machine Code"
              id="machine_code"
              placeholder="e.g., M-005"
              value={formData.machine_code}
              onChange={(e) => setFormData((prev) => ({ ...prev, machine_code: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-chocolate-700 mb-2">
                Machine Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-chocolate-500 focus:border-chocolate-500 sm:text-sm"
              >
                {MACHINE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Input
              label="Location"
              id="location"
              placeholder="e.g., Floor 1, Zone B"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-chocolate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Technical specs, installation date, etc."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2.5 border border-chocolate-200 rounded-lg focus:ring-2 focus:ring-chocolate-500 focus:border-transparent transition-all resize-none text-chocolate-800"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="default" isLoading={createMachineMutation.isPending} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Register Machine
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegisterMachineModal;
