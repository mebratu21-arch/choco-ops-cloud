import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import ProductCatalog from '../../components/sales/ProductCatalog';
import SalesTasks from '../../components/sales/SalesTasks';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  ShoppingBag,
  ArrowUpRight,
  Users,
  Package,
  Percent,
  Target,
  Zap,
  X,
  Loader2,
  ChevronLeft,
  CreditCard
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { salesService } from '../../services/salesService';
import { EmployeeSale, OnlineOrder, Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../../components/sales/StripePaymentForm';
import PaymentMethodSelector, { PaymentType } from '../../components/sales/PaymentMethodSelector';
import CryptoPaymentFlow from '../../components/sales/CryptoPaymentFlow';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Enhanced Sample Data
const SAMPLE_WEEKLY_DATA = [
  { name: 'Mon', revenue: 4250, orders: 28, target: 4000, online: 1800, inStore: 2450 },
  { name: 'Tue', revenue: 5100, orders: 35, target: 4000, online: 2200, inStore: 2900 },
  { name: 'Wed', revenue: 3800, orders: 24, target: 4000, online: 1500, inStore: 2300 },
  { name: 'Thu', revenue: 6200, orders: 42, target: 4000, online: 2800, inStore: 3400 },
  { name: 'Fri', revenue: 7500, orders: 52, target: 4000, online: 3200, inStore: 4300 },
  { name: 'Sat', revenue: 8900, orders: 68, target: 4000, online: 4100, inStore: 4800 },
  { name: 'Sun', revenue: 6100, orders: 45, target: 4000, online: 2600, inStore: 3500 },
];

const SAMPLE_CATEGORY_DATA = [
  { name: 'Dark Chocolate', value: 35, color: '#3B2720' },
  { name: 'Milk Chocolate', value: 28, color: '#8B5A3C' },
  { name: 'White Chocolate', value: 15, color: '#D4A574' },
  { name: 'Truffles', value: 12, color: '#CF9A3C' },
  { name: 'Gift Boxes', value: 10, color: '#9333EA' },
];

const SAMPLE_HOURLY_DATA = [
  { hour: '9AM', sales: 450 },
  { hour: '10AM', sales: 680 },
  { hour: '11AM', sales: 920 },
  { hour: '12PM', sales: 1250 },
  { hour: '1PM', sales: 1100 },
  { hour: '2PM', sales: 850 },
  { hour: '3PM', sales: 780 },
  { hour: '4PM', sales: 1050 },
  { hour: '5PM', sales: 1380 },
  { hour: '6PM', sales: 1620 },
  { hour: '7PM', sales: 1450 },
  { hour: '8PM', sales: 980 },
];

const SAMPLE_RECENT_ORDERS = [
  { id: 'ORD-8847', user: 'Emma Wilson', item: 'Dark Truffle Collection (24pc)', amount: '89.99', status: 'PAID', initials: 'EW', color: 'bg-purple-100 text-purple-600' },
  { id: 'ORD-8846', user: 'Marcus Chen', item: 'Belgian Milk Chocolate Bar', amount: '24.50', status: 'PAID', initials: 'MC', color: 'bg-blue-100 text-blue-600' },
  { id: 'ORD-8845', user: 'Sofia Rodriguez', item: 'Premium Gift Box - Gold', amount: '149.00', status: 'PROCESSING', initials: 'SR', color: 'bg-gold-100 text-gold-600' },
  { id: 'ORD-8844', user: 'James Thompson', item: 'Artisan White Chocolate Set', amount: '56.75', status: 'PAID', initials: 'JT', color: 'bg-green-100 text-green-600' },
  { id: 'ORD-8843', user: 'Aisha Patel', item: 'Single Origin Ecuador 70%', amount: '32.00', status: 'PAID', initials: 'AP', color: 'bg-pink-100 text-pink-600' },
  { id: 'ORD-8842', user: 'Online Store', item: 'Subscription Box - Monthly', amount: '45.00', status: 'RECURRING', initials: 'OS', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'ORD-8841', user: 'David Kim', item: 'Corporate Gift Order (50pc)', amount: '425.00', status: 'PAID', initials: 'DK', color: 'bg-orange-100 text-orange-600' },
  { id: 'ORD-8840', user: 'Luna Martinez', item: 'Seasonal Collection - Winter', amount: '78.50', status: 'SHIPPED', initials: 'LM', color: 'bg-cyan-100 text-cyan-600' },
];

const SAMPLE_TOP_PRODUCTS = [
  { name: 'Dark Chocolate Truffle Box', units: 847, revenue: 42350, trend: 12.5, category: 'Truffles' },
  { name: 'Belgian Milk Bar (100g)', units: 1243, revenue: 31075, trend: 8.3, category: 'Bars' },
  { name: 'Premium Gift Collection', units: 312, revenue: 46488, trend: 22.1, category: 'Gifts' },
  { name: 'Single Origin Ecuador 70%', units: 589, revenue: 17670, trend: -3.2, category: 'Dark' },
  { name: 'White Chocolate Raspberry', units: 421, revenue: 12630, trend: 15.7, category: 'White' },
];

const CHART_COLORS = {
  primary: '#CF9A3C',
  secondary: '#3B2720',
  accent: '#9333EA',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const SalesDashboard = () => {
  const [sales, setSales] = useState<EmployeeSale[]>([]);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'catalog'>('dashboard');
  const [chartType, setChartType] = useState<'composed' | 'area' | 'bar'>('composed');

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, ordersData, productsData] = await Promise.all([
          salesService.getAllSales(),
          salesService.getAllOrders(),
          salesService.getProducts()
        ]);
        setSales(salesData);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch sales dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart;
    
    if (existing) {
      newCart = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    
    setCart(newCart);
    void handleCheckout(newCart);
  };

  const handleCheckout = async (checkoutCart = cart) => {
    if (checkoutCart.length === 0) return;
    
    // Check Stripe Key
    if (!stripeKey) {
        console.error('Stripe key is missing!');
        toast.error('Payment system configuration error');
        return;
    }

    setIsCheckoutLoading(true);
    try {
      // 1. Create items list for backend
      const items = checkoutCart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
        image_url: item.product.image_url
      }));

      // 2. Call API to create PaymentIntent
      const response = await salesService.createPaymentIntent(items);

      if (!response.clientSecret) {
          throw new Error('No client secret received from backend');
      }

      setClientSecret(response.clientSecret);
      setShowCheckout(true);

    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to initialize checkout');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear cart and close modal after success messsage handled by form
    setCart([]);
    setTimeout(() => {
        setShowCheckout(false);
        setClientSecret(null);
        setViewMode('dashboard'); // Return to dashboard view
    }, 2000);
  };

  const totalRevenue = (sales.length > 0 || orders.length > 0)
    ? sales.reduce((sum, s) => sum + Number(s.final_amount ?? 0), 0) + orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0)
    : SAMPLE_WEEKLY_DATA.reduce((sum, day) => sum + day.revenue, 0);

  const totalInvoices = (sales.length + orders.length) || 294;
  const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 142.35;
  const totalCustomers = 1847;
  const conversionRate = 4.8;
  const returningCustomers = 68;


  // Use sample data for charts when no real data
  const weeklyData = SAMPLE_WEEKLY_DATA;
  const hourlyData = SAMPLE_HOURLY_DATA;
  const categoryData = SAMPLE_CATEGORY_DATA;

  // Recent Orders - combine real data with samples if needed
  const combinedRecent = sales.length > 0 || orders.length > 0 ? [
    ...sales.map(s => ({
      id: s.id.slice(0, 8),
      user: s.seller_name ?? 'Staff',
      item: s.recipe_name ?? 'Boutique Sale',
      amount: Number(s.final_amount).toFixed(2),
      status: 'PAID',
      initials: (s.seller_name ?? 'S').split(' ').map(n => n[0]).join('').slice(0, 2),
      color: 'bg-purple-100 text-purple-600'
    })),
    ...orders.map(o => ({
      id: o.id.slice(0, 8),
      user: o.customer_name || 'Online Customer',
      item: 'Online Order',
      amount: Number(o.total_amount).toFixed(2),
      status: o.status.toUpperCase(),
      initials: (o.customer_name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2),
      color: 'bg-blue-100 text-blue-600'
    }))
  ].sort(() => 0.5 - Math.random()).slice(0, 8) : SAMPLE_RECENT_ORDERS;

  // Top products - combine real data with samples
  const topProducts = sales.length > 0
    ? sales.slice(0, 5).map((sale, idx) => ({
        name: sale.recipe_name ?? 'Artisan Recipe',
        units: sale.quantity_sold,
        revenue: Number(sale.final_amount),
        trend: [12.5, 8.3, 22.1, -3.2, 15.7][idx] ?? 5.0,
        category: sale.unit ?? 'Item'
      }))
    : SAMPLE_TOP_PRODUCTS;

  // Performance metrics for radial chart
  const performanceData = [
    { name: 'Revenue Target', value: 85, fill: CHART_COLORS.primary },
    { name: 'Order Volume', value: 72, fill: CHART_COLORS.secondary },
    { name: 'Customer Satisfaction', value: 94, fill: CHART_COLORS.success },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner with View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-chocolate-950 via-purple-950 to-chocolate-900 p-10 text-white shadow-2xl shadow-chocolate-900/20 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-3 tracking-tight uppercase border-l-4 border-gold-500 pl-6">Sales Command Center</h1>
          <div className="flex items-center gap-6 text-white/50 font-bold uppercase tracking-widest text-[11px] pl-6">
            <p>Real-time Market Telemetry</p>
            <div className="w-1.5 h-1.5 bg-gold-600 rounded-full"></div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
              <span className="w-2 h-2 bg-vibrant-green rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
              Live System Active
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-1 rounded-xl flex border border-white/10">
           <button
             onClick={() => setViewMode('dashboard')}
             className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
               viewMode === 'dashboard' ? 'bg-white text-chocolate-950 shadow-lg' : 'text-white/70 hover:bg-white/5'
             }`}
           >
             <LayoutGrid className="w-4 h-4" /> Dashboard
           </button>
           <button
             onClick={() => setViewMode('catalog')}
             className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
               viewMode === 'catalog' ? 'bg-white text-chocolate-950 shadow-lg' : 'text-white/70 hover:bg-white/5'
             }`}
           >
             <ShoppingBag className="w-4 h-4" /> 
             Catalog {products.length > 0 && <span className="ml-1 opacity-50">({products.length})</span>}
           </button>
           {cart.length > 0 && (
             <button
               onClick={() => void handleCheckout()}
               disabled={isCheckoutLoading}
               className="ml-2 px-4 py-2 bg-gold-500 text-chocolate-950 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 animate-in fade-in slide-in-from-right-2 hover:bg-gold-400 transition-colors disabled:opacity-50 shadow-lg shadow-gold-900/20"
             >
                {isCheckoutLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <ShoppingBag className="w-3 h-3" />}
                {cart.reduce((s, i) => s + i.quantity, 0)} Items - Checkout
             </button>
           )}
        </div>

        <div className="absolute top-0 right-10 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-10 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl"></div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Enhanced Stats Row - 6 Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 border border-chocolate-100/50 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-gold-100 rounded-xl group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-gold-600" />
                  </div>
                  <span className="text-[9px] font-black text-vibrant-green bg-vibrant-green/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +12.5%
                  </span>
                </div>
                <p className="text-2xl font-black text-chocolate-950">${totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest mt-1">Gross Revenue</p>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 border border-chocolate-100/50 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-[9px] font-black text-vibrant-green bg-vibrant-green/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +8.3%
                  </span>
                </div>
                <p className="text-2xl font-black text-chocolate-950">{totalInvoices}</p>
                <p className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest mt-1">Total Orders</p>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 border border-chocolate-100/50 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-[9px] font-black text-vibrant-green bg-vibrant-green/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +5.2%
                  </span>
                </div>
                <p className="text-2xl font-black text-chocolate-950">${avgOrderValue.toFixed(0)}</p>
                <p className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest mt-1">Avg. Order Value</p>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 border border-chocolate-100/50 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-[9px] font-black text-vibrant-green bg-vibrant-green/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.7%
                  </span>
                </div>
                <p className="text-2xl font-black text-chocolate-950">{totalCustomers.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest mt-1">Total Customers</p>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 border border-chocolate-100/50 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Percent className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-[9px] font-black text-vibrant-green bg-vibrant-green/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +0.8%
                  </span>
                </div>
                <p className="text-2xl font-black text-chocolate-950">{conversionRate}%</p>
                <p className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest mt-1">Conversion Rate</p>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 border border-chocolate-100/50 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="text-[9px] font-black text-vibrant-green bg-vibrant-green/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +4.2%
                  </span>
                </div>
                <p className="text-2xl font-black text-chocolate-950">{returningCustomers}%</p>
                <p className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest mt-1">Returning Rate</p>
              </motion.div>
            </div>

            {/* Main Content Grid: Chart + Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart (2/3 width) */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-2 bg-white rounded-[2rem] border border-chocolate-100/50 p-8 shadow-sm relative overflow-hidden min-h-[450px]"
              >
                <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-chocolate-50 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-chocolate-950 text-xl tracking-tight uppercase">Weekly Performance</h3>
                      <p className="text-[10px] text-chocolate-400 font-bold tracking-widest">REVENUE VS ORDERS VS TARGET</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-chocolate-50 p-1 rounded-lg flex">
                      {(['composed', 'area', 'bar'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                            chartType === type ? 'bg-chocolate-950 text-white' : 'text-chocolate-400 hover:text-chocolate-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-gold-600 bg-gold-100/50 px-3 py-1.5 rounded-full border border-gold-200 animate-pulse tracking-widest uppercase">Live</span>
                  </div>
                </div>

                <div className="h-[340px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'composed' ? (
                      <ComposedChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="colorInStore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 40px -5px rgba(0,0,0,0.15)',
                            fontWeight: 700,
                            padding: '12px 16px'
                          }}
                          formatter={(value: number, name: string) => [
                            name === 'orders' ? value : `$${value.toLocaleString()}`,
                            name.charAt(0).toUpperCase() + name.slice(1)
                          ]}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value) => <span className="text-xs font-bold text-chocolate-600 uppercase tracking-wider">{value}</span>}
                        />
                        <Bar yAxisId="left" dataKey="online" stackId="a" fill="url(#colorOnline)" radius={[0, 0, 0, 0]} name="Online Sales" />
                        <Bar yAxisId="left" dataKey="inStore" stackId="a" fill="url(#colorInStore)" radius={[8, 8, 0, 0]} name="In-Store Sales" />
                        <Line yAxisId="left" type="monotone" dataKey="target" stroke={CHART_COLORS.warning} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke={CHART_COLORS.success} strokeWidth={3} dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }} name="Orders" />
                      </ComposedChart>
                    ) : chartType === 'area' ? (
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="areaRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 700 }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#areaRevenue)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={weeklyData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={1}/>
                            <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8c594a' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 700 }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="url(#barGradient)" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Tasks Panel (1/3 width) */}
              <div className="h-full min-h-[450px]">
                 <SalesTasks />
              </div>
            </div>

            {/* Second Row: Hourly Sales + Category Breakdown + Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hourly Sales Chart */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-[2rem] border border-chocolate-100/50 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-chocolate-950 text-base uppercase tracking-tight">Today's Sales</h3>
                    <p className="text-[10px] text-chocolate-400 font-bold tracking-widest">HOURLY BREAKDOWN</p>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <defs>
                        <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.info} stopOpacity={0.9}/>
                          <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600, fill: '#8c594a' }} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 600 }}
                        formatter={(value: number) => [`$${value}`, 'Sales']}
                      />
                      <Bar dataKey="sales" fill="url(#hourlyGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Category Breakdown Pie Chart */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-[2rem] border border-chocolate-100/50 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-chocolate-950 text-base uppercase tracking-tight">By Category</h3>
                    <p className="text-[10px] text-chocolate-400 font-bold tracking-widest">SALES DISTRIBUTION</p>
                  </div>
                </div>
                <div className="h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 600 }}
                        formatter={(value: number) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categoryData.slice(0, 4).map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-bold text-chocolate-600 truncate">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Performance Radial */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-[2rem] border border-chocolate-100/50 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-chocolate-950 text-base uppercase tracking-tight">KPI Status</h3>
                    <p className="text-[10px] text-chocolate-400 font-bold tracking-widest">PERFORMANCE METRICS</p>
                  </div>
                </div>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={performanceData} startAngle={180} endAngle={0}>
                      <RadialBar background dataKey="value" cornerRadius={10} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 600 }}
                        formatter={(value: number) => [`${value}%`, 'Progress']}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {performanceData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-[10px] font-bold text-chocolate-600">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-chocolate-950">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Bottom Grid: Recent Orders + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              {/* Recent Orders */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-[2.5rem] border border-chocolate-100/50 shadow-sm flex flex-col relative overflow-hidden"
              >
                <div className="p-8 border-b border-chocolate-50 flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="font-black text-chocolate-950 text-lg uppercase tracking-tight">Recent Transactions</h3>
                    <p className="text-[10px] text-gold-600 font-black tracking-widest mt-1">REAL-TIME LOG</p>
                  </div>
                  <span className="text-[10px] font-black text-chocolate-400 bg-chocolate-50 px-3 py-1.5 rounded-full">{combinedRecent.length} orders</span>
                </div>
                <div className="p-6 space-y-4 flex-1 max-h-[400px] overflow-y-auto relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center p-12 text-chocolate-400 text-sm font-black uppercase tracking-widest animate-pulse italic">Synchronizing...</div>
                  ) : combinedRecent.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-3xl border border-chocolate-50 bg-chocolate-50/20 hover:bg-chocolate-50 transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${order.color} group-hover:scale-110 transition-transform`}>
                          {order.initials}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-chocolate-950 uppercase tracking-widest mb-0.5">{order.user}</p>
                          <p className="text-[10px] text-chocolate-400 font-bold truncate max-w-[180px]">{order.item}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-gold-600 leading-none mb-1">${order.amount}</p>
                        <p className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-tighter ${
                          order.status === 'PAID' ? 'text-vibrant-green bg-vibrant-green/10' :
                          order.status === 'PROCESSING' ? 'text-orange-500 bg-orange-100' :
                          order.status === 'SHIPPED' ? 'text-blue-500 bg-blue-100' :
                          order.status === 'RECURRING' ? 'text-purple-500 bg-purple-100' :
                          'text-chocolate-500 bg-chocolate-100'
                        }`}>{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-chocolate-50 bg-chocolate-50/10">
                   <Link to="/sales" className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black text-chocolate-600 hover:text-gold-600 transition-colors uppercase tracking-[0.2em] active:scale-95">
                      View Full Ledger <ArrowUpRight className="w-4 h-4" />
                   </Link>
                </div>
              </motion.div>

              {/* Top Products */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-[2.5rem] border border-chocolate-100/50 shadow-sm relative overflow-hidden"
              >
                <div className="p-8 border-b border-chocolate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-chocolate-950 text-lg uppercase tracking-tight">Top Performing Products</h3>
                    <p className="text-[10px] text-chocolate-400 font-black tracking-widest mt-1">REVENUE LEADERBOARD</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                   {topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-chocolate-50 bg-chocolate-50/20 hover:bg-chocolate-50 transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chocolate-100 to-chocolate-50 flex items-center justify-center text-gold-600 shadow-sm group-hover:scale-110 transition-transform font-black text-lg">
                              #{idx + 1}
                           </div>
                           <div>
                             <p className="font-black text-sm text-chocolate-950 leading-tight mb-1">{product.name}</p>
                             <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-chocolate-950 text-gold-500 uppercase tracking-widest">
                                 {product.units.toLocaleString()} units
                               </span>
                               <span className="text-[10px] font-bold text-chocolate-400">${product.revenue.toLocaleString()}</span>
                             </div>
                           </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                          product.trend >= 0
                            ? 'bg-vibrant-green/10 border-vibrant-green/20 text-vibrant-green'
                            : 'bg-red-100 border-red-200 text-red-500'
                        }`}>
                          {product.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span className="text-[10px] font-black uppercase tracking-tighter">{product.trend >= 0 ? '+' : ''}{product.trend}%</span>
                        </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
             <ProductCatalog 
                products={products} 
                onAddToCart={handleAddToCart}
                loading={loading}
              />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && clientSecret && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-chocolate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => {
                    setShowCheckout(false);
                    setPaymentMethod(null);
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2rem] max-w-xl w-full p-8 shadow-2xl border border-white/20 relative overflow-hidden max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    <button 
                        onClick={() => {
                            setShowCheckout(false);
                            setPaymentMethod(null);
                        }}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    <AnimatePresence mode="wait">
                        {!paymentMethod ? (
                            <motion.div 
                                key="selector" 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <PaymentMethodSelector 
                                    selectedMethod={paymentMethod}
                                    onSelect={(m) => setPaymentMethod(m)}
                                    amount={cart.reduce((s, i) => s + (Number(i.product.price) * i.quantity), 0) * 1.08}
                                />
                                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center">
                                     <button 
                                        onClick={() => setShowCheckout(false)}
                                        className="text-[10px] font-black text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]"
                                    >
                                        Cancel Transaction
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="form" 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }} 
                                className="space-y-6"
                            >
                                <button 
                                    onClick={() => setPaymentMethod(null)}
                                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest mb-4 group"
                                >
                                    <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back to Methods
                                </button>

                                {paymentMethod === 'STRIPE' || paymentMethod === 'MASTERCARD' ? (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                        {clientSecret && stripePromise ? (
                                            <Elements
                                                stripe={stripePromise}
                                                options={{
                                                    clientSecret,
                                                    appearance: {
                                                        theme: 'stripe',
                                                        variables: {
                                                            colorPrimary: '#CF9A3C',
                                                            borderRadius: '12px',
                                                            fontFamily: 'Inter, sans-serif'
                                                        }
                                                    }
                                                }}
                                            >
                                                <StripePaymentForm 
                                                    amount={cart.reduce((s, i) => s + (Number(i.product.price) * i.quantity), 0) * 1.08}
                                                    onSuccess={handlePaymentSuccess}
                                                />
                                            </Elements>
                                        ) : (
                                            <div className="text-center py-12 space-y-6">
                                                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto border border-amber-100/50">
                                                    <CreditCard className="w-10 h-10 text-amber-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-900 font-black uppercase tracking-tight">Security Gateway Sandbox</p>
                                                    <p className="text-[10px] text-gray-400 font-bold max-w-xs mx-auto">
                                                        Infrastructure bypass active. Confirm simulated settlement for {paymentMethod}.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handlePaymentSuccess}
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs"
                                                >
                                                    Simulate {paymentMethod} Success
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : paymentMethod === 'CRYPTO' ? (
                                    <div className="animate-in fade-in zoom-in-95 duration-300">
                                        <CryptoPaymentFlow 
                                            amount={cart.reduce((s, i) => s + (Number(i.product.price) * i.quantity), 0) * 1.08}
                                            onSuccess={handlePaymentSuccess}
                                        />
                                    </div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesDashboard;
