import { useState, useEffect, useCallback } from 'react';
import api from '@/data/infrastructure/httpClient';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

interface Batch {
  id: string;
  recipe_id: string;
  quantity_produced: number;
  status: string;
  created_at: string;
}

interface Ingredient {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
}

export default function ProductionPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    recipe_id: '',
    quantity_produced: '',
    ingredients: [{ ingredient_id: '', quantity: 0 }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [batchesRes, ingRes] = await Promise.all([
        api.get('/production/batches'),
        api.get('/inventory'),
      ]);
      setBatches(batchesRes.data.data || []);
      setIngredients(ingRes.data.data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { ingredient_id: '', quantity: 0 }],
    });
  };

  const updateIngredient = (index: number, field: 'ingredient_id' | 'quantity', value: string | number) => {
    const newIng = [...form.ingredients];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newIng[index] = { ...newIng[index], [field]: value } as any;
    setForm({ ...form, ingredients: newIng });
  };

  const createBatch = async () => {
    if (!form.recipe_id || !form.quantity_produced) {
      toast.error('Recipe ID and quantity are required');
      return;
    }

    try {
      await api.post('/production/batches', form);
      
      // Reset form
      setForm({ 
        recipe_id: '', 
        quantity_produced: '', 
        ingredients: [{ ingredient_id: '', quantity: 0 }] 
      });

      // Refresh list
      const res = await api.get('/production/batches');
      setBatches(res.data.data || []);
      
      toast.success('Batch created successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create batch');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>

      {/* Create Batch Form */}
      <div className="bg-white p-6 rounded-xl shadow border border-secondary-200">
        <h2 className="text-xl font-semibold mb-4 text-secondary-900">Create New Batch</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipe ID</label>
            <input
              type="text"
              value={form.recipe_id}
              onChange={e => setForm({ ...form, recipe_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="recipe-uuid-123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Produced</label>
            <input
              type="number"
              value={form.quantity_produced}
              onChange={e => setForm({ ...form, quantity_produced: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              min="1"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-secondary-900">Ingredients</h3>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              <Plus size={16} />
              Add Ingredient
            </button>
          </div>

          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-4 mb-3">
              <select
                value={ing.ingredient_id}
                onChange={e => updateIngredient(idx, 'ingredient_id', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Ingredient</option>
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.current_stock} {i.unit} available)
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={ing.quantity}
                onChange={e => updateIngredient(idx, 'quantity', Number(e.target.value))}
                className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Qty"
                min="0.1"
                step="0.1"
              />
            </div>
          ))}
        </div>

        <button
          onClick={createBatch}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Create Batch
        </button>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-xl shadow border border-secondary-200 overflow-hidden">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">Active Batches</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading batches...</p>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No active batches found
                  </td>
                </tr>
              ) : (
                batches.map(batch => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {batch.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.recipe_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.quantity_produced}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        batch.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        batch.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(batch.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
