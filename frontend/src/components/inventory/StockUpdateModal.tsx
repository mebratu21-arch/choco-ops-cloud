import React, { useState, useEffect } from 'react';
import { InventoryItem, StockUpdateData } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({ isOpen, onClose, item }) => {
  const { useUpdateStock } = useInventory();
  const updateStockMutation = useUpdateStock();

  const [quantity, setQuantity] = useState<string>('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [reason, setReason] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('');
      setMovementType('IN');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qtyValue = parseFloat(quantity);
    if (!quantity || isNaN(qtyValue) || qtyValue <= 0) {
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }

    try {
      const updateData: StockUpdateData = {
        quantity: qtyValue,
        movementType,
        reason: reason || `Manual ${movementType} update`
      };

      await updateStockMutation.mutateAsync({ id: item.id, data: updateData });
      toast.success('Stock updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
    }
  };

  const currentPreview = () => {
    const qty = parseFloat(quantity) || 0;
    if (movementType === 'IN') return item.quantity + qty;
    if (movementType === 'OUT') return item.quantity - qty;
    return qty; // Adjustment sets the absolute value
  };

  const previewValue = currentPreview();
  const isLow = previewValue <= (item.reorder_level ?? 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Stock Level"
      description={`Adjusting stock for ${item.name}`}
      size="md"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Status Card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Stock</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.quantity} {item.unit}</p>
            </div>
            <ArrowRightLeft className="w-5 h-5 text-slate-400" />
            <div className="text-right">
              <p className="text-sm text-slate-500">New Balance</p>
              <p className={`text-lg font-bold ${
                isLow ? 'text-amber-600' : 'text-primary'
              }`}>
                {previewValue} {item.unit}
              </p>
            </div>
          </div>
          
          {isLow && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              <span>Warning: This will result in low stock (Reorder: {item.reorder_level})</span>
            </div>
          )}
        </div>

        {/* Movement Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Action Type</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMovementType('IN')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                movementType === 'IN'
                  ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg font-bold mb-1">+ Add</span>
              <span className="text-xs opacity-80">Restock / Return</span>
            </button>
            <button
              type="button"
              onClick={() => setMovementType('OUT')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                movementType === 'OUT'
                  ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg font-bold mb-1">- Remove</span>
              <span className="text-xs opacity-80">Usage / Waste</span>
            </button>
            <button
              type="button"
              onClick={() => setMovementType('ADJUSTMENT')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                movementType === 'ADJUSTMENT'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg font-bold mb-1">= Set</span>
              <span className="text-xs opacity-80">Cycle Count</span>
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <Input
          label={movementType === 'ADJUSTMENT' ? 'New Total Quantity' : 'Quantity'}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          autoFocus
        />

        {/* Reason */}
        <Textarea
          label="Reason / Notes"
          placeholder="Optional notes regarding this adjustment..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={updateStockMutation.isPending}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={updateStockMutation.isPending}
            loadingText="Saving..."
          >
            Confirm Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockUpdateModal;
