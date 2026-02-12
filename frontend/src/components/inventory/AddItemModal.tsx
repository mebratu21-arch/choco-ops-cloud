import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { toast } from 'sonner';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null; // If provided, we're editing
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, editItem }) => {
  const { useCreateItem, useUpdateItem } = useInventory();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const isEditing = !!editItem;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'raw_material' as InventoryItem['category'],
    unit: 'kg',
    quantity: '0',
    reorderLevel: '10',
    description: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name ?? '',
        code: editItem.code ?? '',
        category: editItem.category ?? 'raw_material',
        unit: editItem.unit ?? 'kg',
        quantity: String(editItem.quantity ?? 0),
        reorderLevel: String(editItem.reorder_level ?? 10),
        description: '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        category: 'raw_material',
        unit: 'kg',
        quantity: '0',
        reorderLevel: '10',
        description: '',
      });
    }
  }, [editItem, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Name and Code are required');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        category: formData.category,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity) || 0,
        reorder_level: parseFloat(formData.reorderLevel) || 10,
        description: formData.description.trim() || undefined,
      };

      if (isEditing && editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast.success(`${formData.name} updated successfully`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${formData.name} added to inventory`);
      }
      onClose();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : (isEditing ? 'Failed to update item' : 'Failed to add item');
      toast.error(errorMsg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      description={isEditing ? `Editing ${editItem?.name}` : 'Fill in the details below to add a new item.'}
      size="md"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Item Name"
            placeholder="e.g. Cocoa Butter"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />
          <Input
            label="Item Code"
            placeholder="e.g. CB-001"
            value={formData.code}
            onChange={e => handleChange('code', e.target.value)}
            required
            disabled={isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chocolate-500/20"
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
            >
              <option value="raw_material">Raw Material</option>
              <option value="packaging">Packaging</option>
              <option value="ingredient">Ingredient</option>
              <option value="finished_good">Finished Good</option>
            </select>
          </div>
          <Input
            label="Unit"
            placeholder="e.g. kg, pcs, liters"
            value={formData.unit}
            onChange={e => handleChange('unit', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Initial Quantity"
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity}
            onChange={e => handleChange('quantity', e.target.value)}
          />
          <Input
            label="Reorder Level"
            type="number"
            min="0"
            step="0.01"
            value={formData.reorderLevel}
            onChange={e => handleChange('reorderLevel', e.target.value)}
          />
        </div>

        <Textarea
          label="Description (Optional)"
          placeholder="Brief description or notes..."
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddItemModal;
