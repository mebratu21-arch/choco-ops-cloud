import { ArrowUpDown, AlertTriangle } from 'lucide-react';
import Badge from '@/presentation/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/presentation/components/ui/Table';
import EditableStockCell from './EditableStockCell';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

export default function InventoryTable({
  items,
  setSort,
  updateStock,
}: {
  items: InventoryItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sort: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSort: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStock: any;
}) {
  const handleSort = (field: string) => {
    setSort((prev: any) => ({
      field,
      dir: prev?.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <Table>
        <THead>
          <TR>
            {[
              { label: 'Name / SKU', key: 'name' },
              { label: 'Current Stock', key: 'current_stock' },
              { label: 'Minimum Stock', key: 'minimum_stock' },
              { label: 'Unit', key: null },
              { label: 'Status', key: null },
            ].map(col => (
              <TH key={col.label}>
                {col.key ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1"
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </button>
                ) : (
                  col.label
                )}
              </TH>
            ))}
          </TR>
        </THead>

        <TBody>
          {items.map(item => {
            const isLow = item.current_stock <= item.minimum_stock;

            return (
              <TR key={item.id}>
                <TD>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.sku}</div>
                </TD>

                <TD>
                  <EditableStockCell item={item} updateStock={updateStock} />
                </TD>

                <TD>{item.minimum_stock}</TD>
                <TD>{item.unit}</TD>

                <TD>
                  {isLow ? (
                    <Badge variant="danger">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low
                    </Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
