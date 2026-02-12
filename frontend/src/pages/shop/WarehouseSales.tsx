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
  Package,
  CreditCard,
  ArrowUpDown,
  Calendar,
  Ruler,
  ChevronLeft
} from 'lucide-react';
import PaymentMethodSelector, { PaymentType } from '../../components/sales/PaymentMethodSelector';
import CryptoPaymentFlow from '../../components/sales/CryptoPaymentFlow';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

// Product Interface
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discount_price?: number;
    image: string;
    rating: number;
    category: string;
    stock: number;
    piece_count?: number; // Size/Size variant
    created_at: Date;
}

// Extracted chocolate products (same as ShopCatalog but with dates)
const MOCK_PRODUCTS: Product[] = [
    {
        id: 'CHOC-AUTO-GEN-001',
        name: 'ChocoOps Artisan Gift Box Collection',
        description: 'Luxury assorted chocolate gift box with decorative bow. Premium 12-piece selection.',
        price: 45.00,
        discount_price: 36.00,
        rating: 4.9,
        category: 'Bonbon',
        stock: 25,
        piece_count: 12,
        image: 'C:/Users/mebra/.gemini/antigravity/brain/c65db79c-6fe8-423f-b58b-262a85d73edc/uploaded_media_0_1769679647422.png',
        created_at: new Date('2025-12-01')
    },
    {
        id: 'CHOC-AUTO-GEN-002',
        name: 'ChocoOps Elegant White Box Assortment',
        description: 'Sophisticated white gift box with ribbon. Artisan bonbons with nuts and decorative patterns.',
        price: 38.00,
        discount_price: 30.50,
        rating: 4.8,
        category: 'Bonbon',
        stock: 30,
        piece_count: 9,
        image: 'C:/Users/mebra/.gemini/antigravity/brain/c65db79c-6fe8-423f-b58b-262a85d73edc/uploaded_media_1_1769679647422.png',
        created_at: new Date('2026-01-10')
    },
    {
        id: 'CHOC-AUTO-GEN-003',
        name: 'ChocoOps Valentine Heart Collection',
        description: 'Premium heart-shaped chocolates with decorative patterns. Perfect for Valentine\'s Day.',
        price: 52.00,
        discount_price: 41.50,
        rating: 4.9,
        category: 'Bonbon',
        stock: 15,
        piece_count: 16,
        image: 'C:/Users/mebra/.gemini/antigravity/brain/c65db79c-6fe8-423f-b58b-262a85d73edc/uploaded_media_2_1769679647422.png',
        created_at: new Date('2026-01-20')
    },
    {
        id: 'CHOC-AUTO-GEN-004',
        name: 'ChocoOps Holiday Truffle Collection',
        description: 'Festive chocolate truffles with various coatings. Holiday/Christmas edition in red box.',
        price: 42.00,
        discount_price: 33.50,
        rating: 4.7,
        category: 'Truffle',
        stock: 40,
        piece_count: 9,
        image: 'C:/Users/mebra/.gemini/antigravity/brain/c65db79c-6fe8-423f-b58b-262a85d73edc/uploaded_media_3_1769679647422.png',
        created_at: new Date('2025-11-15')
    },
    {
        id: 'CHOC-AUTO-GEN-005',
        name: 'ChocoOps Love Letter Chocolate Gift',
        description: 'Ultra-premium custom LOVE design with edible flowers. White and gold luxury packaging.',
        price: 68.00,
        discount_price: 54.50,
        rating: 5.0,
        category: 'Bonbon',
        stock: 12,
        piece_count: 24,
        image: 'C:/Users/mebra/.gemini/antigravity/brain/c65db79c-6fe8-423f-b58b-262a85d73edc/uploaded_media_4_1769679647422.png',
        created_at: new Date('2026-01-05')
    }
];

type SortMode = 'name' | 'size' | 'date';

const WarehouseSales = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentType | null>(null);

    const filteredProducts = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        if (sortMode === 'name') return a.name.localeCompare(b.name);
        if (sortMode === 'size') return (b.piece_count ?? 0) - (a.piece_count ?? 0);
        if (sortMode === 'date') return b.created_at.getTime() - a.created_at.getTime();
        return 0;
    });

    const handleAddToCart = (product: Product) => {
        setCartCount(prev => prev + 1);
        toast.success(`${product.name} added to cart!`);
    };

    const handlePayment = (method: string) => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
            loading: `Processing ${method} payment...`,
            success: 'Payment Successful! Receipt emailed.',
            error: 'Payment failed'
        });
        setShowPayment(false);
        setCartCount(0);
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cocoa-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900 flex items-center gap-3">
                        <Package className="h-8 w-8 text-cocoa-600" />
                        Warehouse Company Shop
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        Direct-to-Consumer & Employee Sales Portal
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => cartCount > 0 ? setShowPayment(true) : toast.error('Cart is empty')}
                        className="gap-2 bg-gradient-to-r from-cocoa-600 to-cocoa-500 hover:from-cocoa-700 hover:to-cocoa-600 text-white shadow-lg shadow-cocoa-200"
                    >
                        <ShoppingCart className="h-4 w-4" /> 
                        Checkout ({cartCount})
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-cocoa-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search inventory..."
                        className="ps-9 border-cocoa-200 focus:border-gold-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Sort by:</span>
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                        <Button 
                            variable="ghost" 
                            size="sm" 
                            onClick={() => setSortMode('name')}
                            className={sortMode === 'name' ? 'bg-white shadow-sm text-cocoa-700' : 'text-slate-500 hover:text-cocoa-600'}
                        >
                            <ArrowUpDown className="h-3 w-3 mr-1" /> Name
                        </Button>
                        <Button 
                            variable="ghost" 
                            size="sm" 
                            onClick={() => setSortMode('size')}
                            className={sortMode === 'size' ? 'bg-white shadow-sm text-cocoa-700' : 'text-slate-500 hover:text-cocoa-600'}
                        >
                            <Ruler className="h-3 w-3 mr-1" /> Size
                        </Button>
                        <Button 
                            variable="ghost" 
                            size="sm" 
                            onClick={() => setSortMode('date')}
                            className={sortMode === 'date' ? 'bg-white shadow-sm text-cocoa-700' : 'text-slate-500 hover:text-cocoa-600'}
                        >
                            <Calendar className="h-3 w-3 mr-1" /> Date
                        </Button>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="group overflow-hidden border-cocoa-100 hover:border-gold-200 hover:shadow-xl transition-all duration-300">
                        <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <ShoppingBag className="h-16 w-16 text-cocoa-300 group-hover:scale-110 transition-transform duration-500" />
                            )}
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                {product.piece_count && (
                                    <Badge className="bg-white/90 text-cocoa-800 hover:bg-white shadow-sm backdrop-blur-sm">
                                        {product.piece_count} pcs
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gold-600 font-medium uppercase tracking-wider">{product.category}</p>
                                    <CardTitle className="text-lg text-cocoa-900 line-clamp-1">{product.name}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10">
                                {product.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-cocoa-800">${product.discount_price?.toFixed(2)}</span>
                                    <span className="text-xs text-slate-400">Retail: <span className="line-through">${product.price.toFixed(2)}</span></span>
                                </div>

                                <Button 
                                    size="sm"
                                    className="bg-cocoa-100 hover:bg-cocoa-200 text-cocoa-800"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payment Modal Overlay */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={() => setShowPayment(false)}>
                    <Card className="w-full max-w-xl shadow-2xl border-gold-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <CardContent className="p-8">
                            <AnimatePresence mode="wait">
                                {!paymentMethod ? (
                                    <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <PaymentMethodSelector 
                                            selectedMethod={null as any}
                                            onSelect={(m) => setPaymentMethod(m)}
                                            amount={MOCK_PRODUCTS.filter(p => p.id === 'CHOC-AUTO-GEN-001').reduce((s, p) => s + p.price, 0)} // Placeholder amount
                                        />
                                        <Button 
                                            variant="ghost" 
                                            className="w-full mt-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]"
                                            onClick={() => setShowPayment(false)}
                                        >
                                            Cancel Transaction
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                        <button 
                                            onClick={() => setPaymentMethod(null)}
                                            className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest mb-4"
                                        >
                                            <ChevronLeft className="w-3 h-3" /> Change Method
                                        </button>

                                        {paymentMethod === 'STRIPE' || paymentMethod === 'MASTERCARD' ? (
                                             <div className="text-center py-12 space-y-6">
                                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto border border-blue-100/50">
                                                    <CreditCard className="w-10 h-10 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{paymentMethod} Settlement</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure gateway simulation active</p>
                                                </div>
                                                <Button
                                                    onClick={() => handlePayment(paymentMethod)}
                                                    className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs"
                                                >
                                                    Authorize Payment
                                                </Button>
                                             </div>
                                        ) : paymentMethod === 'CRYPTO' ? (
                                            <CryptoPaymentFlow 
                                                amount={45.00} // Placeholder
                                                onSuccess={() => handlePayment('Crypto')}
                                            />
                                        ) : null}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default WarehouseSales;
