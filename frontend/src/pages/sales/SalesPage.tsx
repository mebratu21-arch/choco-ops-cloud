import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { salesService } from '../../services/salesService';
import { OnlineOrder, EmployeeSale, Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StripePaymentForm from '../../components/sales/StripePaymentForm';
import PaymentMethodSelector, { PaymentType } from '../../components/sales/PaymentMethodSelector';
import CryptoPaymentFlow from '../../components/sales/CryptoPaymentFlow';
import {
  AlertCircle,
  Store,
  DollarSign,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  LayoutGrid,
  Tag,
  Monitor,
  Zap,
  ChevronRight,
  Filter,
  Plus,
  ChevronLeft,
  Package,
  Minus,
  Check,
  Loader2,
  X,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Stripe outside component to avoid recreation
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;



interface CartItem {
  product: Product;
  quantity: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const SalesPage: React.FC = () => {
    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<EmployeeSale[]>([]);
    const [orders, setOrders] = useState<OnlineOrder[]>([]);
    const [categoryList, setCategoryList] = useState<string[]>(['All']);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'hub' | 'catalog' | 'pos'>('hub');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Cart & Payment State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentType>('STRIPE');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [stripeAvailable, setStripeAvailable] = useState<boolean | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const [productsData, categoriesData, paymentConfig, ordersData, salesData] = await Promise.all([
                    salesService.getProducts(),
                    salesService.getProductCategories(),
                    salesService.getPaymentConfig(),
                    salesService.getAllOrders(),
                    salesService.getAllSales()
                ]);
                
                setProducts(productsData);
                setCategoryList(['All', ...categoriesData]);
                setOrders(ordersData);
                setSales(salesData);
                
                // Check if Stripe is properly configured (both env var and backend)
                const isStripeConfigured = !!(stripeKey?.startsWith('pk_'));
                setStripeAvailable(paymentConfig.configured && isStripeConfigured);

            } catch (error) {
                console.error('Failed to load store data:', error);
                setPageError('Failed to synchronize store data. Please refresh.');
            } finally {
                setLoading(false);
            }
        };

        void fetchStoreData();
    }, []);

    // Cart functions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotalWithTax = cartTotal * 1.08;

    // Create Stripe payment intent when card payment is selected
    const initiateStripePayment = async () => {
        if (cart.length === 0) return;

        setPaymentLoading(true);
        setPaymentError(null);

        try {
            const items = cart.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image_url: item.product.image_url,
            }));

            const result = await salesService.createPaymentIntent(items);
            setClientSecret(result.clientSecret);
        } catch (error) {
            console.error('Failed to create payment intent:', error);
            setPaymentError(error instanceof Error ? error.message : 'Failed to initialize payment');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Handle cash/transfer payment (mock)
    const processCashPayment = async () => {
        setPaymentSuccess(false);
        setPaymentLoading(true);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        setPaymentSuccess(true);
        setPaymentLoading(false);

        // Clear cart after successful payment
        setTimeout(() => {
            setCart([]);
            setShowPayment(false);
            setPaymentSuccess(false);
            setShowCart(false);
            setClientSecret(null);
        }, 2000);
    };

    // Handle successful Stripe payment
    const handleStripeSuccess = () => {
        setPaymentSuccess(true);
        setTimeout(() => {
            setCart([]);
            setShowPayment(false);
            setPaymentSuccess(false);
            setShowCart(false);
            setClientSecret(null);
        }, 2000);
    };

    // Close payment modal
    const closePaymentModal = () => {
        if (!paymentLoading && !paymentSuccess) {
            setShowPayment(false);
            setClientSecret(null);
            setPaymentError(null);
        }
    };

    // Filter and paginate products
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const totalRev = sales.reduce((sum, s) => sum + Number(s.final_amount), 0) +
                     orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    const activeStream = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

    return (
        <motion.div
          className="space-y-10 pb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
            {/* Premium Hub Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-chocolate-950 via-chocolate-900 to-[#2A150D] p-10 text-white shadow-2xl shadow-chocolate-950/40 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/20 rounded-xl backdrop-blur-sm border border-amber-500/30">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Commercial Command</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tighter uppercase border-l-8 border-amber-600 pl-6 leading-none">
                        Sales <br /> <span className="text-amber-500">Hub</span>
                    </h1>
                    <p className="text-chocolate-200/70 font-bold max-w-md pl-8 border-l-2 border-chocolate-800 ml-1.5 mt-4 text-sm leading-relaxed">
                        Manage artisan boutique transactions, product catalog, and direct factory-to-store sales channels.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-inner flex flex-col items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                            {[
                                { key: 'hub', label: 'Operational Hub', icon: LayoutGrid },
                                { key: 'catalog', label: 'Artisan Catalog', icon: Tag },
                                { key: 'pos', label: 'POS Terminal', icon: Monitor }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as 'hub' | 'catalog' | 'pos')}
                                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                                        activeTab === tab.key
                                            ? 'bg-amber-500 text-chocolate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                            : 'text-chocolate-200 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        {cartItemCount > 0 && (
                            <motion.button
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => setShowCart(true)}
                                className="w-full bg-white text-chocolate-950 px-8 py-3.5 rounded-2xl hover:bg-amber-50 transition-all font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95"
                            >
                                <ShoppingCart className="w-5 h-5 text-amber-600" />
                                Cart Locked: {cartItemCount} Items
                            </motion.button>
                        )}
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-10 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-10 -ml-20 -mb-20 w-64 h-64 rounded-full bg-chocolate-400/10 blur-3xl" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-5 pointer-events-none" />
            </motion.div>

            {/* Content Layers */}
            <AnimatePresence mode="wait">
                {activeTab === 'hub' && (
                    <motion.div
                        key="hub"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Stats Cluster */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Settled Revenue', value: `$${totalRev.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                                { label: 'Active In-Flow', value: activeStream.toString(), icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { label: 'Total Invoices', value: (sales.length + orders.length).toString(), icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    variants={itemVariants}
                                    className="bg-gradient-to-br from-chocolate-950 to-[#2A150D] p-8 rounded-[2rem] border border-chocolate-800/50 shadow-lg hover:shadow-2xl hover:shadow-amber-900/20 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`p-4 rounded-2xl bg-white/10 ${stat.color} group-hover:scale-110 transition-transform backdrop-blur-sm border border-white/5`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full bg-amber-500/60 w-2/3`} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </div>
                        
                        {pageError && (
                             <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-center gap-4 text-red-200">
                                 <AlertCircle className="w-6 h-6 text-red-500" />
                                 <div>
                                     <h3 className="font-bold text-red-500">System Error</h3>
                                     <p className="text-sm">{pageError}. Please refresh the console.</p>
                                 </div>
                             </div>
                        )}

                        {/* Recent Signals */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="rounded-[2.5rem] border-chocolate-800/50 bg-chocolate-950 shadow-lg overflow-hidden flex flex-col min-h-[500px]">
                                <CardHeader className="p-8 border-b border-chocolate-800/50 bg-chocolate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Active Supply Stream</CardTitle>
                                            <p className="text-[10px] text-amber-500 font-black tracking-widest mt-1 uppercase">Cloud Sync Active</p>
                                        </div>
                                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">LIVE</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 overflow-y-auto max-h-[500px]">
                                    {loading ? (
                                        <div className="p-20 text-center text-chocolate-400 font-black uppercase tracking-widest animate-pulse">Synchronizing Neural Link...</div>
                                    ) : orders.length === 0 ? (
                                        <div className="p-20 text-center text-chocolate-400 font-black uppercase tracking-widest italic">Zero stream signals detected.</div>
                                    ) : (
                                        <div className="divide-y divide-chocolate-50">
                                            {orders.map(order => (
                                                <div key={order.id} className="flex items-center justify-between p-6 hover:bg-chocolate-50/50 transition-all group cursor-pointer">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                                                            order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                                            order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                            'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            <ShoppingBag className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-chocolate-950 text-base">{order.customer_name ?? 'Artisan Customer'}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-black text-chocolate-400 uppercase tracking-tighter bg-chocolate-50 px-2 py-0.5 rounded">ID: {order.id.slice(0, 8)}</span>
                                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                                                    order.status === 'delivered' ? 'text-green-600' :
                                                                    order.status === 'cancelled' ? 'text-red-600' :
                                                                    'text-blue-600'
                                                                }`}>{order.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-chocolate-950 text-lg leading-none mb-1">${Number(order.total_amount).toFixed(2)}</p>
                                                        <ChevronRight className="w-5 h-5 text-chocolate-200 group-hover:text-amber-500 transition-all scale-75 group-hover:scale-100" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* POS Quick Access */}
                            <button className="bg-chocolate-950 text-left rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between group cursor-pointer w-full hover:shadow-2xl hover:shadow-amber-900/20 transition-all border border-transparent hover:border-amber-500/30" onClick={() => { console.log('Launching POS'); setActiveTab('pos'); }}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-700" />
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-10 border border-white/5 shadow-2xl">
                                        <Monitor className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 tracking-tighter leading-tight">Launch <br /> POS Terminal</h2>
                                    <p className="text-chocolate-200/50 font-bold max-w-xs text-sm leading-relaxed">
                                        Access the boutique checkout system for direct employee sales and factory-gate transactions.
                                    </p>
                                </div>
                                <div className="relative z-10 mt-10">
                                    <div className="flex items-center gap-4 text-amber-500 font-black text-xs uppercase tracking-[0.2em]">
                                        Secure Channel L4
                                        <div className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]" />
                                    </div>
                                </div>
                                <div className="absolute bottom-10 right-10">
                                    <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-500">
                                        <ChevronRight className="w-6 h-6 group-hover:text-chocolate-950 transition-colors" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'catalog' && (
                    <motion.div
                        key="catalog"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-10"
                    >
                        {/* Filter Bar */}
                        <div className="flex items-center gap-4 bg-gradient-to-r from-chocolate-950 to-[#2A150D] p-5 rounded-3xl border border-chocolate-800/50 shadow-lg flex-wrap">
                            <div className="flex items-center gap-3 px-4 border-r border-chocolate-700/50 shrink-0">
                                <Filter className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">Collection Filter</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {categoryList.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-amber-500 text-chocolate-950 shadow-lg shadow-amber-500/20'
                                                : 'text-chocolate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-chocolate-700'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {paginatedProducts.map(product => (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ y: -6 }}
                                    className="bg-gradient-to-br from-chocolate-950 to-[#1A0E08] rounded-[2rem] border border-chocolate-800/50 shadow-lg overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all"
                                >
                                    <div className="h-64 relative overflow-hidden bg-chocolate-900">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                        <div className="absolute bottom-4 left-4">
                                            <Badge className="bg-amber-500 text-chocolate-950 font-black border-none py-1.5 px-4 rounded-xl shadow-xl">{product.category}</Badge>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors uppercase tracking-tight">{product.name}</h3>
                                        <div className="mt-auto pt-6 border-t border-chocolate-800/50 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1">MSRP / Unit</p>
                                                <span className="text-2xl font-black text-white">${product.price.toFixed(2)}</span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-chocolate-950 transition-all duration-300 border border-amber-500/30 hover:border-amber-500 active:scale-90"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-12 pb-10">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl font-black text-[10px] uppercase h-10 border-chocolate-100"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Protocol Back
                                </Button>
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${
                                                currentPage === page
                                                    ? 'bg-amber-500 text-chocolate-950 shadow-xl shadow-amber-500/20'
                                                    : 'bg-chocolate-900 text-chocolate-300 border border-chocolate-700 hover:border-amber-500/50 hover:text-white'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-xl font-black text-[10px] uppercase h-10 border-chocolate-100"
                                >
                                    Next Phase <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'pos' && (
                    <motion.div
                        key="pos"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                    >
                        {/* Interactive POS Matrix */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-gradient-to-r from-chocolate-950 to-[#2A150D] p-6 rounded-3xl border border-chocolate-800/50 shadow-lg flex items-center justify-between">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Monitor className="w-6 h-6 text-amber-500" />
                                    Terminal Alpha-1
                                </h2>
                                <div className="flex items-center gap-2 text-[10px] font-black text-amber-500/70">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_#22c55e]" /> SYSTEM ARMED
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {products.map(product => {
                                    const inCart = cart.find(item => item.product.id === product.id);
                                    return (
                                        <motion.button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-4 rounded-3xl border-2 transition-all relative overflow-hidden group ${
                                                inCart
                                                    ? 'border-amber-500 bg-amber-500/10'
                                                    : 'border-chocolate-800 bg-chocolate-950 hover:border-chocolate-600'
                                            }`}
                                        >
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full aspect-square object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform"
                                            />
                                            <p className="font-black text-white text-[11px] uppercase tracking-tight truncate mb-1">{product.name}</p>
                                            <p className="font-black text-amber-400 text-[10px]">${product.price.toFixed(2)}</p>
                                            
                                            {inCart && (
                                                <div className="absolute top-2 right-2 bg-amber-500 text-chocolate-950 text-[9px] font-black w-6 h-6 rounded-lg flex items-center justify-center shadow-lg border-2 border-white">
                                                    {inCart.quantity}
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cart Protocol Sidebar */}
                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] border-chocolate-100/50 shadow-2xl overflow-hidden sticky top-32">
                                <CardHeader className="p-8 border-b border-chocolate-50 bg-chocolate-950 text-white relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                        <ShoppingCart className="w-24 h-24" />
                                    </div>
                                    <CardTitle className="font-black flex items-center gap-3 relative z-10 uppercase tracking-widest text-sm">
                                        <Package className="w-5 h-5 text-amber-500" /> Current Invoice
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-chocolate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-chocolate-200 shadow-inner rotate-12">
                                                <ShoppingCart className="w-10 h-10" />
                                            </div>
                                            <p className="font-black text-chocolate-400 uppercase tracking-widest text-xs">Awaiting Input...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {cart.map(item => (
                                                    <div key={item.product.id} className="flex items-center gap-4 group">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-chocolate-50">
                                                            <img src={item.product.image_url} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-chocolate-950 text-[11px] truncate uppercase">{item.product.name}</p>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                <div className="flex items-center bg-chocolate-50 rounded-lg p-1">
                                                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white transition-all"><Minus className="w-3 h-3 text-chocolate-400" /></button>
                                                                    <span className="w-6 text-center text-[10px] font-black text-chocolate-950">{item.quantity}</span>
                                                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white transition-all"><Plus className="w-3 h-3 text-chocolate-400" /></button>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-amber-600">${(item.product.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-6 border-t border-chocolate-50 space-y-3">
                                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-chocolate-400">
                                                    <span>Sub-Flow</span>
                                                    <span>${cartTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-chocolate-400">
                                                    <span>VAT Correction (8%)</span>
                                                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-2xl font-black text-chocolate-950 pt-4 border-t-2 border-dashed border-chocolate-50">
                                                    <span>TOTAL</span>
                                                    <span>${(cartTotal * 1.08).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full mt-6 bg-chocolate-950 text-amber-500 font-black py-8 rounded-[1.5rem] hover:bg-chocolate-900 transition-all shadow-xl shadow-chocolate-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4"
                                                onClick={() => setShowPayment(true)}
                                            >
                                                <Check className="w-5 h-5" /> Commit Invoice
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlays */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-chocolate-950/40 backdrop-blur-sm z-50 overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                        />
                        <motion.div
                            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[60] shadow-2xl flex flex-col"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="p-10 border-b border-chocolate-50 flex items-center justify-between bg-chocolate-950 text-white">
                                <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                                    <ShoppingCart className="w-6 h-6 text-amber-500" /> Cart Vault
                                </h2>
                                <button onClick={() => setShowCart(false)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-6">
                                {cart.map(item => (
                                    <div key={item.product.id} className="flex gap-6 p-6 bg-chocolate-50/50 rounded-3xl border border-chocolate-100 group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white shadow-sm shrink-0">
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <h3 className="font-black text-chocolate-950 uppercase tracking-tight text-lg leading-tight">{item.product.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-white rounded-xl p-1 border border-chocolate-100">
                                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-chocolate-50"><Minus className="w-4 h-4 text-chocolate-950" /></button>
                                                    <span className="w-10 text-center font-black text-xs">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-chocolate-50"><Plus className="w-4 h-4 text-chocolate-950" /></button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">Revoke</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-10 border-t border-chocolate-100 bg-chocolate-50/30">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest mb-1">Gross Yield</p>
                                        <span className="text-4xl font-black text-chocolate-950 tracking-tighter">${(cartTotal * 1.08).toFixed(2)}</span>
                                    </div>
                                    <Badge className="bg-amber-500 text-chocolate-950 font-black mb-1">VAT INC.</Badge>
                                </div>
                                <Button
                                    className="w-full bg-chocolate-950 text-amber-500 font-black py-8 rounded-[1.5rem] text-sm uppercase tracking-[0.3em] active:scale-95"
                                    onClick={() => { setShowCart(false); setShowPayment(true); }}
                                >
                                    Initiate Settlement
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}

                {showPayment && (
                    <motion.div
                        className="fixed inset-0 bg-chocolate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePaymentModal}
                    >
                        <motion.div
                            className="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] border border-white/10 max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                {paymentSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-16 text-center"
                                    >
                                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                                            <Check className="w-12 h-12 text-white stroke-[4px]" />
                                        </div>
                                        <h2 className="text-4xl font-black text-chocolate-950 mb-4 tracking-tighter uppercase">Invoice Settled</h2>
                                        <p className="text-chocolate-500 font-bold max-w-xs mx-auto text-sm">Transaction fingerprint generated. Inventory manifests updated in real-time.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="flex flex-col md:flex-row min-h-[600px]">
                                            {/* Left Column: Product Summary */}
                                            <div className="w-full md:w-[45%] bg-[#F7F8F9] p-12 flex flex-col justify-between border-r border-gray-100">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-12">
                                                        <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center border border-gray-100">
                                                            <Store className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        {!stripeAvailable && (
                                                            <span className="bg-[#FFF4E5] text-[#663C00] text-[11px] font-black px-2.5 py-1.5 rounded uppercase tracking-wider">Test Mode</span>
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-gray-500 font-bold text-sm mb-2 uppercase tracking-widest opacity-60">Total Amount</p>
                                                    <h2 className="text-7xl font-black text-gray-900 tracking-tighter mb-12">${cartTotalWithTax.toFixed(2)}</h2>
                                                    
                                                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                                        {cart.map(item => (
                                                            <div key={item.product.id} className="flex justify-between items-center py-3 border-b border-gray-200/50 group">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="bg-white px-2 py-1 rounded-md text-[10px] font-black text-gray-400 border border-gray-100">{item.quantity}x</span>
                                                                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{item.product.name}</span>
                                                                </div>
                                                                <span className="text-sm font-black text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
                                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                            <span>Subtotal</span>
                                                            <span>${cartTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                            <span>Tax (8%)</span>
                                                            <span>${(cartTotal * 0.08).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-12">
                                                    <button 
                                                        onClick={closePaymentModal} 
                                                        className="text-gray-400 hover:text-blue-600 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest group"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                                                        Return to boutique
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Right Column: Dynamic Form */}
                                            <div className="flex-1 p-12 bg-white flex flex-col">
                                                <div className="max-w-md mx-auto w-full">
                                                    {/* Payment Controller */}
                                                    <AnimatePresence mode="wait">
                                                        {!paymentMethod ? (
                                                            <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                                <PaymentMethodSelector 
                                                                    selectedMethod={paymentMethod}
                                                                    onSelect={(m) => setPaymentMethod(m)}
                                                                    amount={cartTotalWithTax}
                                                                />
                                                            </motion.div>
                                                        ) : (
                                                            <div className="space-y-8">
                                                                <button 
                                                                    onClick={() => setPaymentMethod(null as any)}
                                                                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest mb-4"
                                                                >
                                                                    <ChevronLeft className="w-3 h-3" /> Change Method
                                                                </button>

                                                                {paymentMethod === 'STRIPE' || paymentMethod === 'MASTERCARD' ? (
                                                                    <div key="card">
                                                                        {!stripeAvailable ? (
                                                                            <div className="text-center py-12 space-y-6">
                                                                                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto border border-amber-100/50">
                                                                                    <CreditCard className="w-10 h-10 text-amber-500" />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Stripe Offline</h4>
                                                                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                                                                        Infrastructure bypass active. Confirm simulated transaction.
                                                                                    </p>
                                                                                </div>
                                                                                <Button
                                                                                    onClick={() => { void processCashPayment(); }}
                                                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl"
                                                                                >
                                                                                    Simulate {paymentMethod} Payment
                                                                                </Button>
                                                                            </div>
                                                                        ) : paymentLoading ? (
                                                                            <div className="flex flex-col items-center justify-center py-24">
                                                                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                                                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Handshaking securely...</p>
                                                                            </div>
                                                                        ) : clientSecret && stripePromise ? (
                                                                            <Elements
                                                                                stripe={stripePromise}
                                                                                options={{
                                                                                    clientSecret,
                                                                                    appearance: {
                                                                                        theme: 'stripe',
                                                                                        variables: {
                                                                                            colorPrimary: '#D97706',
                                                                                            colorBackground: '#ffffff',
                                                                                            colorText: '#431407',
                                                                                            colorDanger: '#ef4444',
                                                                                            fontFamily: '"Inter", system-ui, sans-serif',
                                                                                            borderRadius: '16px',
                                                                                        },
                                                                                    },
                                                                                }}
                                                                            >
                                                                                <StripePaymentForm
                                                                                    amount={cartTotalWithTax}
                                                                                    onSuccess={handleStripeSuccess}
                                                                                />
                                                                            </Elements>
                                                                        ) : (
                                                                            <div className="text-center py-12">
                                                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Security authorization required</p>
                                                                                <Button
                                                                                    onClick={() => { void initiateStripePayment(); }}
                                                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                                                                                >
                                                                                    Authorize Secure Channel
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : paymentMethod === 'CRYPTO' ? (
                                                                    <CryptoPaymentFlow 
                                                                        amount={cartTotalWithTax}
                                                                        cart={cart}
                                                                        onSuccess={handleStripeSuccess}
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SalesPage;
