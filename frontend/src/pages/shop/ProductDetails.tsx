import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Package, 
  Truck
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Data (in real app, fetch by ID)
const PRODUCT = {
    id: '1',
    name: 'Artisan Dark Chocolate Truffles',
    description: 'Experience the depth of 70% dark chocolate ganache, infused with a hint of Madagascar vanilla and coated in a crisp shell of our signature dark blend. Hand-rolled by our master chocolatiers.',
    price: 25.00,
    discount_price: 18.00,
    rating: 4.8,
    reviews: 124,
    category: 'Truffles',
    stock: 50,
    images: ['/placeholder-truffle.jpg']
};

const ProductDetails = () => {
    const navigate = useNavigate();
    // const { id } = useParams<{ id: string }>(); // Using mock data for now
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        toast.success(`Added ${quantity} x ${PRODUCT.name} to cart`);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
            <Button 
                variant="ghost" 
                onClick={() => navigate('/shop')}
                className="mb-6 text-slate-500 hover:text-cocoa-600 gap-2 pl-0"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Shop
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-cocoa-50 to-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-cocoa-100">
                        <Package className="h-32 w-32 text-cocoa-200" />
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-start">
                            <Badge className="bg-gold-100 text-gold-700 hover:bg-gold-200 mb-2">
                                {PRODUCT.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-gold-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-bold text-slate-700">{PRODUCT.rating}</span>
                                <span className="text-sm text-slate-400">({PRODUCT.reviews} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold font-serif text-cocoa-900 mb-2">{PRODUCT.name}</h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {PRODUCT.description}
                        </p>
                    </div>

                    <Card className="bg-slate-50 border-slate-200">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold text-green-700">${PRODUCT.discount_price.toFixed(2)}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm text-slate-400 line-through">${PRODUCT.price.toFixed(2)}</span>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 ml-0 hover:bg-green-200">
                                        Staff Saving: ${(PRODUCT.price - PRODUCT.discount_price).toFixed(2)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-cocoa-200 rounded-md bg-white">
                                    <button 
                                        className="h-10 w-10 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        className="w-12 h-10 text-center border-x border-cocoa-200 focus:outline-none"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button 
                                        className="h-10 w-10 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                    In Stock ({PRODUCT.stock} available)
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1 bg-cocoa-600 hover:bg-cocoa-700 text-white h-12 text-lg gap-2" onClick={handleAddToCart}>
                                    <ShoppingCart className="h-5 w-5" /> Add to Cart
                                </Button>
                                <Button variant="outline" className="h-12 w-12 border-cocoa-200 text-red-500 hover:bg-red-50 hover:border-red-200">
                                    <Heart className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-6 text-sm text-slate-500 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>Free Factory Pickup</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Staff Gift Wrapping Available</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
