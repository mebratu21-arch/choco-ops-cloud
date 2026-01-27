import Input from '@/presentation/components/ui/Input';
import { Search } from 'lucide-react';

interface InventoryFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  lowStockOnly: boolean;
  setLowStockOnly: (v: boolean) => void;
  setPage: (v: number) => void;
}

export default function InventoryFilters({
  search,
  setSearch,
  lowStockOnly,
  setLowStockOnly,
  setPage,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:w-80">
        <Input
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search inventory..."
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={e => {
            setLowStockOnly(e.target.checked);
            setPage(1);
          }}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        Low stock only
      </label>
    </div>
  );
}
