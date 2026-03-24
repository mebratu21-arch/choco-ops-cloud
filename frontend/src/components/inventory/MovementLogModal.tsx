import React from 'react';
import { Modal } from '../common/Modal';
import { InventoryMovement } from '../../types';
import { ArrowUp, ArrowDown, Package, History } from 'lucide-react';

interface MovementLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: InventoryMovement[];
  itemName: string;
}

const MovementLogModal: React.FC<MovementLogModalProps> = ({ isOpen, onClose, movements, itemName }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory Movement History"
      description={`Full log for ${itemName}`}
      size="lg"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No movement history recorded for this item.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {movements.map((move, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between group hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    move.movement_type?.toLowerCase() === 'in' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : move.movement_type?.toLowerCase() === 'out'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-600'
                  }`}>
                    {move.movement_type?.toLowerCase() === 'in' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : move.movement_type?.toLowerCase() === 'out' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <History className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-chocolate-600 transition-colors uppercase tracking-tight">
                        {move.movement_type}BOUND
                      </span>
                      {move.reference_id && (
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded leading-none">
                          REF: {move.reference_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(move.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-black font-mono ${
                    move.movement_type?.toLowerCase() === 'in' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {move.movement_type?.toLowerCase() === 'in' ? '+' : '-'}{move.quantity}
                  </span>
                  {move.notes && (
                    <p className="text-[10px] text-slate-400 italic mt-1 max-w-[200px] truncate">
                      {move.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MovementLogModal;
