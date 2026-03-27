'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, 
  Clock, Check, X, Tag, Truck, AlertTriangle, Layers, Archive, MapPin
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { adminAPI, productsAPI, shippingAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatPrice, formatDate, getStatusColor, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/ui/Footer';
import Button from '../../../components/ui/Button';

export default function AdminDashboard({ params: { locale = 'en' } }) {
  const [stats, setStats] = useState(null);
  const [pendingTraders, setPendingTraders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [shippingAreas, setShippingAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const adminT = dict?.admin || {};
  
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router, locale]);

  const fetchData = async () => {
    try {
      const [statsRes, tradersRes, topProductsRes, lowStockRes, offersRes, shippingRes, categoriesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingTraders(),
        adminAPI.getTopProducts({ limit: 5 }),
        adminAPI.getLowStock({ threshold: 10 }),
        adminAPI.getActiveOffers ? adminAPI.getActiveOffers() : Promise.resolve({ data: { offers: [] } }),
        shippingAPI.getAreas(),
        productsAPI.getCategories(),
      ]);
      setStats(statsRes.data.stats);
      setPendingTraders(tradersRes.data.traders || []);
      setTopProducts(topProductsRes.data.products || []);
      setLowStockProducts(lowStockRes.data.products || []);
      setActiveOffers(offersRes.data.offers || []);
      setShippingAreas(shippingRes.data.areas || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTrader = async (id) => {
    try {
      await adminAPI.approveTrader(id);
      toast.success('Trader approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve trader');
    }
  };

  const handleRejectTrader = async (id) => {
    try {
      await adminAPI.rejectTrader(id);
      toast.success('Trader rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject trader');
    }
  };

  const managementCards = [
    { id: 'products', title: 'Product Management', description: 'Add and edit products', icon: Package, href: `/${locale}/admin/products`, action: 'Manage' },
    { id: 'categories', title: 'Category Management', description: 'Create and edit categories', icon: Layers, href: `/${locale}/admin/categories`, action: 'Manage' },
    { id: 'shipping', title: 'Shipping & Delivery', description: 'Manage shipping areas', icon: Truck, href: `/${locale}/admin/shipping`, action: 'Manage' },
    { id: 'addresses', title: 'Address Management', description: 'Manage delivery addresses', icon: MapPin, href: `/${locale}/admin/addresses`, action: 'Manage' },
    { id: 'orders', title: 'Order Management', description: 'Edit and track orders', icon: ShoppingCart, href: `/${locale}/admin/orders`, action: 'View All' },
    { id: 'users', title: 'Manage Accounts', description: 'Edit and delete users', icon: Users, href: `/${locale}/admin/users`, action: 'Manage' },
    { id: 'offers', title: 'Offers & Discounts', description: 'Create discount codes', icon: Tag, href: `/${locale}/admin/offers`, action: 'Manage' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="container-custom">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6 bg-dark-800 border-dark-600">
                  <div className="skeleton h-4 w-24 mb-2" />
                  <div className="skeleton h-8 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-dark-900">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {adminT.dashboard || 'Admin Dashboard'}
              </h1>
              <p className="text-gray-400 mt-2">
                Manage your platform, users, and orders
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
              {['overview', 'management', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab 
                      ? "bg-brand-red text-white" 
                      : "bg-dark-700 text-gray-400 hover:text-white"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pb-12">
        <div className="container-custom">
          {/* Management Tab */}
          {activeTab === 'management' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementCards.map((card) => (
                <Link 
                  key={card.id}
                  href={card.href}
                  className="card p-6 bg-dark-800 border-dark-600 hover:border-brand-red/50 hover:shadow-brand transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-brand-red/10">
                      <card.icon className="w-6 h-6 text-brand-red" />
                    </div>
                    <span className="text-brand-red opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-4 text-white">{card.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{card.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm text-brand-red font-medium">
                    {card.action} →
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-brand-red/10">
                      <Users className="w-6 h-6 text-brand-red" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats?.users?.total || 0}</p>
                      <p className="text-xs text-gray-500">
                        {stats?.users?.customers || 0} customers, {stats?.users?.traders || 0} traders
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <ShoppingCart className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-white">{stats?.orders?.total || 0}</p>
                      <p className="text-xs text-gray-500">
                        {stats?.orders?.pending || 0} pending
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">{formatPrice(stats?.orders?.total_revenue || 0, locale)}</p>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        This month
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      <Package className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Products</p>
                      <p className="text-2xl font-bold text-white">{stats?.products?.total || 0}</p>
                      <p className="text-xs text-gray-500">
                        {stats?.products?.total_stock || 0} total stock
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Traders */}
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h2 className="text-lg font-semibold text-white mb-4">{adminT.pendingTraders || 'Pending Traders'}</h2>
                  {pendingTraders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No pending traders</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingTraders.map((trader) => (
                        <div key={trader.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                          <div>
                            <p className="font-medium text-white">{trader.name}</p>
                            <p className="text-sm text-gray-400">{trader.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTrader(trader.id)}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectTrader(trader.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Selling Products */}
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h2 className="text-lg font-semibold text-white mb-4">Top Selling Products</h2>
                  {topProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No sales data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                          <span className="w-6 h-6 flex items-center justify-center bg-brand-red/20 text-brand-red rounded-full text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-white">{product.name_en}</p>
                            <p className="text-xs text-gray-400">{product.total_sold} sold</p>
                          </div>
                          <p className="font-semibold text-green-400">
                            {formatPrice(product.total_revenue, locale)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockProducts.length > 0 && (
                <div className="mt-8 card p-6 bg-dark-800 border-dark-600 border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lowStockProducts.slice(0, 6).map((product) => (
                      <div key={product.id} className="p-3 bg-orange-500/10 rounded-lg">
                        <p className="font-medium text-sm text-white">{product.name_en}</p>
                        <p className="text-xs text-orange-400">Only {product.stock} left</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h3 className="text-sm text-gray-400 mb-2">Today's Orders</h3>
                  <p className="text-2xl font-bold text-white">{stats?.today_orders?.count || 0}</p>
                  <p className="text-sm text-green-400">
                    {formatPrice(stats?.today_orders?.revenue || 0, locale)} revenue
                  </p>
                </div>
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h3 className="text-sm text-gray-400 mb-2">This Month</h3>
                  <p className="text-2xl font-bold text-white">{stats?.month_orders?.count || 0}</p>
                  <p className="text-sm text-green-400">
                    {formatPrice(stats?.month_orders?.revenue || 0, locale)} revenue
                  </p>
                </div>
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h3 className="text-sm text-gray-400 mb-2">Open Support Tickets</h3>
                  <p className="text-2xl font-bold text-white">{stats?.tickets?.open || 0}</p>
                  <p className="text-sm text-gray-400">
                    {stats?.tickets?.total || 0} total tickets
                  </p>
                </div>
              </div>

              {/* Active Offers */}
              <div className="card p-6 bg-dark-800 border-dark-600">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Active Offers
                  </h2>
                  <Link href={`/${locale}/admin/offers`} className="text-sm text-brand-red hover:underline">
                    Manage Offers
                  </Link>
                </div>
                {activeOffers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No active offers</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeOffers.map((offer) => (
                      <div key={offer.id} className="p-4 bg-green-500/10 rounded-lg">
                        <p className="font-bold text-lg text-white">{offer.code}</p>
                        <p className="text-sm text-gray-400">
                          {offer.discount_type === 'percentage' 
                            ? `${offer.discount_value}% off` 
                            : `${formatPrice(offer.discount_value, locale)} off`
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Used: {offer.used_count}/{offer.usage_limit || '∞'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Status Distribution */}
              <div className="card p-6 bg-dark-800 border-dark-600">
                <h2 className="text-lg font-semibold text-white mb-4">Order Status Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { key: 'pending', label: 'Pending', color: 'text-yellow-400' },
                    { key: 'processing', label: 'Processing', color: 'text-blue-400' },
                    { key: 'shipped', label: 'Shipped', color: 'text-purple-400' },
                    { key: 'delivered', label: 'Delivered', color: 'text-green-400' },
                    { key: 'cancelled', label: 'Cancelled', color: 'text-red-400' },
                  ].map((status) => (
                    <div key={status.key} className="text-center p-4 bg-dark-700 rounded-lg">
                      <p className={`text-2xl font-bold ${status.color}`}>{stats?.orders?.[status.key] || 0}</p>
                      <p className="text-sm text-gray-400">{status.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}