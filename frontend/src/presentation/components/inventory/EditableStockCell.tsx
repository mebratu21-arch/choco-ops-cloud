import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import Input from '@/presentation/components/ui/Input';

export default function EditableStockCell({
  item,
  updateStock,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStock: any;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.current_stock.toString());

  const handleSave = () => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;

    updateStock.mutate(
      { id: item.id, current_stock: num },
      { onSuccess: () => setEditing(false) }
    );
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-20 px-2 py-1 text-sm"
          autoFocus
        />

        <button
          onClick={handleSave}
          disabled={updateStock.isLoading}
          className="text-green-600 hover:text-green-800"
        >
          <Save className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            setValue(item.current_stock.toString());
            setEditing(false);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span>{item.current_stock}</span>
      <button
        onClick={() => setEditing(true)}
        className="text-blue-600 hover:text-blue-800"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    </div>
  );
}
