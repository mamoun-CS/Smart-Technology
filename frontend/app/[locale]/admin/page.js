'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, 
  Clock, Check, X, BarChart3, Tag, Truck, AlertTriangle, 
  Plus, Edit, Settings, Layers, Archive, MapPin
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { adminAPI, productsAPI, shippingAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatPrice, formatDate, getStatusColor, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';

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

  // Management Cards Data
  const managementCards = [
    {
      id: 'products',
      title: locale === 'ar' ? 'إدارة المنتجات' : 'Product Management',
      description: locale === 'ar' ? 'إضافة وتعديل المنتجات' : 'Add and edit products',
      icon: Package,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: `/${locale}/admin/products`,
      action: locale === 'ar' ? 'إدارة' : 'Manage'
    },
    {
      id: 'categories',
      title: locale === 'ar' ? 'إدارة الفئات' : 'Category Management',
      description: locale === 'ar' ? 'إنشاء وتعديل الفئات' : 'Create and edit categories',
      icon: Layers,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: `/${locale}/admin/categories`,
      action: locale === 'ar' ? 'إدارة' : 'Manage'
    },
    {
      id: 'shipping',
      title: locale === 'ar' ? 'الشحن والتوصيل' : 'Shipping & Delivery',
      description: locale === 'ar' ? 'إدارة مناطق الشحن' : 'Manage shipping areas',
      icon: Truck,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      href: `/${locale}/admin/shipping`,
      action: locale === 'ar' ? 'إدارة' : 'Manage'
    },
    {
      id: 'orders',
      title: locale === 'ar' ? 'إدارة الطلبات' : 'Order Management',
      description: locale === 'ar' ? 'تعديل وتتبع الطلبات' : 'Edit and track orders',
      icon: ShoppingCart,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      href: `/${locale}/admin/orders`,
      action: locale === 'ar' ? 'عرض الكل' : 'View All'
    },
    {
      id: 'users',
      title: locale === 'ar' ? 'إدارة الحسابات' : 'Manage Accounts',
      description: locale === 'ar' ? 'تعديل وحذف المستخدمين' : 'Edit and delete users',
      icon: Users,
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      href: `/${locale}/admin/users`,
      action: locale === 'ar' ? 'إدارة' : 'Manage'
    },
    {
      id: 'addresses',
      title: locale === 'ar' ? 'عناوين العملاء' : 'Customer Addresses',
      description: locale === 'ar' ? 'عرض عناوين المستخدمين' : 'View user addresses',
      icon: MapPin,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      href: `/${locale}/admin/addresses`,
      action: locale === 'ar' ? 'عرض' : 'View'
    },
    {
      id: 'offers',
      title: locale === 'ar' ? 'العروض والخصومات' : 'Offers & Discounts',
      description: locale === 'ar' ? 'إنشاء أكواد الخصم' : 'Create discount codes',
      icon: Tag,
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
      href: `/${locale}/admin/offers`,
      action: locale === 'ar' ? 'إدارة' : 'Manage'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{adminT.dashboard || 'Admin Dashboard'}</h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  activeTab === 'overview' 
                    ? "bg-primary-100 text-primary-600" 
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {locale === 'ar' ? 'نظرة عامة' : 'Overview'}
              </button>
              <button
                onClick={() => setActiveTab('management')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  activeTab === 'management' 
                    ? "bg-primary-100 text-primary-600" 
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {locale === 'ar' ? 'الإدارة' : 'Management'}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  activeTab === 'analytics' 
                    ? "bg-primary-100 text-primary-600" 
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {locale === 'ar' ? 'التحليلات' : 'Analytics'}
              </button>
            </div>
          </div>

          {/* Management Tab */}
          {activeTab === 'management' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementCards.map((card) => (
                <Link 
                  key={card.id}
                  href={card.href}
                  className="card p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-lg", card.color)}>
                      <card.icon className={cn("w-6 h-6", card.iconColor)} />
                    </div>
                    <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-4">{card.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                  <button className="mt-4 text-sm text-primary-600 font-medium">
                    {card.action} →
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary-100">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                      <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
                      <p className="text-xs text-gray-400">
                        {stats?.users?.customers || 0} {locale === 'ar' ? 'عميل' : 'customers'}, {stats?.users?.traders || 0} {locale === 'ar' ? 'تاجر' : 'traders'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                      <p className="text-2xl font-bold">{stats?.orders?.total || 0}</p>
                      <p className="text-xs text-gray-400">
                        {stats?.orders?.pending || 0} {locale === 'ar' ? 'قيد الانتظار' : 'pending'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                      <p className="text-2xl font-bold">{formatPrice(stats?.orders?.total_revenue || 0, locale)}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {locale === 'ar' ? 'هذا الشهر' : 'This month'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <Package className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'المنتجات' : 'Products'}</p>
                      <p className="text-2xl font-bold">{stats?.products?.total || 0}</p>
                      <p className="text-xs text-gray-400">
                        {stats?.products?.total_stock || 0} {locale === 'ar' ? 'إجمالي المخزون' : 'total stock'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Traders */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">{adminT.pendingTraders || 'Pending Traders'}</h2>
                  {pendingTraders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">{locale === 'ar' ? 'لا يوجد تجار معلقة' : 'No pending traders'}</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingTraders.map((trader) => (
                        <div key={trader.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{trader.name}</p>
                            <p className="text-sm text-gray-500">{trader.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTrader(trader.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectTrader(trader.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">{locale === 'ar' ? 'أفضل المنتجات مبيعاً' : 'Top Selling Products'}</h2>
                  {topProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">{locale === 'ar' ? 'لا توجد بيانات مبيعات بعد' : 'No sales data yet'}</p>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name_en}</p>
                            <p className="text-xs text-gray-500">{product.total_sold} {locale === 'ar' ? 'مبيعات' : 'sold'}</p>
                          </div>
                          <p className="font-semibold text-green-600">
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
                <div className="mt-8 card p-6 border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-semibold">{locale === 'ar' ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lowStockProducts.slice(0, 6).map((product) => (
                      <div key={product.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="font-medium text-sm">{product.name_en}</p>
                        <p className="text-xs text-orange-600">
                          {locale === 'ar' ? `بقي ${product.stock} فقط` : `Only ${product.stock} left`}
                        </p>
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
                <div className="card p-6">
                  <h3 className="text-sm text-gray-500 mb-2">{locale === 'ar' ? 'طلبات اليوم' : "Today's Orders"}</h3>
                  <p className="text-2xl font-bold">{stats?.today_orders?.count || 0}</p>
                  <p className="text-sm text-green-600">
                    {formatPrice(stats?.today_orders?.revenue || 0, locale)} {locale === 'ar' ? 'إيرادات' : 'revenue'}
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-sm text-gray-500 mb-2">{locale === 'ar' ? 'هذا الشهر' : 'This Month'}</h3>
                  <p className="text-2xl font-bold">{stats?.month_orders?.count || 0}</p>
                  <p className="text-sm text-green-600">
                    {formatPrice(stats?.month_orders?.revenue || 0, locale)} {locale === 'ar' ? 'إيرادات' : 'revenue'}
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-sm text-gray-500 mb-2">{locale === 'ar' ? 'تذاكر الدعم المفتوحة' : 'Open Support Tickets'}</h3>
                  <p className="text-2xl font-bold">{stats?.tickets?.open || 0}</p>
                  <p className="text-sm text-gray-400">
                    {stats?.tickets?.total || 0} {locale === 'ar' ? 'إجمالي التذاكر' : 'total tickets'}
                  </p>
                </div>
              </div>

              {/* Active Offers */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {locale === 'ar' ? 'العروض النشطة' : 'Active Offers'}
                  </h2>
                  <Link href={`/${locale}/admin/offers`} className="text-sm text-primary-600 hover:underline">
                    {locale === 'ar' ? 'إدارة العروض' : 'Manage Offers'}
                  </Link>
                </div>
                {activeOffers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{locale === 'ar' ? 'لا توجد عروض نشطة' : 'No active offers'}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeOffers.map((offer) => (
                      <div key={offer.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="font-bold text-lg">{offer.code}</p>
                        <p className="text-sm text-gray-600">
                          {offer.discount_type === 'percentage' 
                            ? `${offer.discount_value}% ${locale === 'ar' ? 'خصم' : 'off'}` 
                            : `${formatPrice(offer.discount_value, locale)} ${locale === 'ar' ? 'خصم' : 'off'}`
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {locale === 'ar' ? 'مستخدم:' : 'Used:'} {offer.used_count}/{offer.usage_limit || '∞'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Status Distribution */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">{locale === 'ar' ? 'توزيع حالة الطلبات' : 'Order Status Overview'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{stats?.orders?.pending || 0}</p>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'معلق' : 'Pending'}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats?.orders?.processing || 0}</p>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{stats?.orders?.shipped || 0}</p>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats?.orders?.delivered || 0}</p>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'تم التسليم' : 'Delivered'}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{stats?.orders?.cancelled || 0}</p>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'ملغى' : 'Cancelled'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}