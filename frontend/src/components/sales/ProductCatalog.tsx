import { useState } from 'react';
import { Search, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Product } from '../../types';

interface ProductCatalogProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
  loading?: boolean;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  products: initialProducts = [], 
  onAddToCart,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(initialProducts.map(p => p.category))];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Controls */}
       <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
             />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
             {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                     categoryFilter === cat 
                     ? 'bg-purple-600 text-white shadow-md' 
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
             ))}
          </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
             <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                   <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   />
                   <div className="absolute top-3 right-3">
                      <Badge variant={(product.stock ?? 0) < 20 ? 'warning' : 'success'} className="shadow-sm">
                         {product.stock ?? 0} In Stock
                      </Badge>
                   </div>
                </div>
                
                <div className="p-5">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors uppercase text-sm tracking-tight">{product.name}</h3>
                      <span className="font-black text-lg text-purple-900">${Number(product.price || 0).toFixed(2)}</span>
                   </div>
                   
                   <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                      <Tag className="w-3 h-3" /> {product.category}
                   </p>
                   
                   <Button 
                    className="w-full gap-2 font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                    onClick={() => onAddToCart?.(product)}
                   >
                      <ShoppingBag className="w-4 h-4" /> Buy Now
                   </Button>
                </div>
             </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 font-bold italic">No products found for this query.</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default ProductCatalog;
