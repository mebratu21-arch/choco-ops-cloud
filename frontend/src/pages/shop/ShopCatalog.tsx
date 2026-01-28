import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  ShoppingCart,
  Heart,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Product Interface
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discount_price?: number;
    image?: string;
    rating: number;
    category: string;
    stock: number;
}

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Artisan Dark Chocolate Truffles',
        description: 'Handcrafted truffles with 70% dark chocolate ganache.',
        price: 25.00,
        discount_price: 18.00, // Employee Price
        rating: 4.8,
        category: 'Truffles',
        stock: 50
    },
    {
        id: '2',
        name: 'Gold Dust Pralines (Box of 12)',
        description: 'Luxurious pralines dusted with edible gold.',
        price: 35.00,
        discount_price: 22.00,
        rating: 4.9,
        category: 'Pralines',
        stock: 20
    },
    {
        id: '3',
        name: 'Ruby Chocolate Bar',
        description: 'Naturally pink chocolate with berry notes.',
        price: 8.50,
        discount_price: 5.00,
        rating: 4.5,
        category: 'Bars',
        stock: 100
    },
    {
        id: '4',
        name: 'Hazelnut Spread Classic',
        description: 'Creamy hazelnut spread made with 40% nuts.',
        price: 12.00,
        discount_price: 8.00,
        rating: 4.7,
        category: 'Spreads',
        stock: 15
    }
];

const ShopCatalog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(0);

    const filteredProducts = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddToCart = (product: Product) => {
        setCartCount(prev => prev + 1);
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Emproyee Shop</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        Exclusive staff discounts activated
                    </p>
                </div>
                <Button className="gap-2 bg-cocoa-600 hover:bg-cocoa-700 text-white relative">
                    <ShoppingCart className="h-4 w-4" /> Cart
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full animate-bounce-slow">
                            {cartCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search chocolates, gifts..."
                    className="ps-9 border-cocoa-200 focus:border-gold-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="group overflow-hidden border-cocoa-100 hover:border-gold-200 hover:shadow-xl transition-all duration-300">
                        <div className="h-48 bg-gradient-to-br from-cocoa-100 to-slate-200 flex items-center justify-center relative">
                            <ShoppingBag className="h-16 w-16 text-cocoa-300 group-hover:scale-110 transition-transform duration-500" />
                            {product.stock < 20 && (
                                <Badge variant="secondary" className="absolute top-2 left-2 bg-red-100 text-red-700 hover:bg-red-200">
                                    Low Stock
                                </Badge>
                            )}
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white text-red-500">
                                <Heart className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gold-600 font-medium uppercase tracking-wider">{product.category}</p>
                                    <CardTitle className="text-lg text-cocoa-900 line-clamp-1">{product.name}</CardTitle>
                                </div>
                                <div className="flex items-center gap-1 bg-gold-50 px-1.5 py-0.5 rounded">
                                    <Star className="h-3 w-3 text-gold-500 fill-current" />
                                    <span className="text-xs font-bold text-gold-700">{product.rating}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                                {product.description}
                            </p>
                            
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-2xl font-bold text-green-700">${product.discount_price?.toFixed(2)}</span>
                                <span className="text-sm text-slate-400 line-through mb-1">${product.price.toFixed(2)}</span>
                            </div>

                            <Button 
                                className="w-full bg-cocoa-500 hover:bg-cocoa-600 text-white shadow-sm group-hover:shadow-md"
                                onClick={() => handleAddToCart(product)}
                            >
                                Add to Cart
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ShopCatalog;
