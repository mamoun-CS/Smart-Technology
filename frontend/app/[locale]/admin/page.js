'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, 
  Clock, Check, X, Tag, Truck, AlertTriangle, Layers, Archive, MapPin,
  ArrowUpRight, ArrowDownRight, Eye, MoreVertical
} from '@/components/icons';
import { useAuthStore } from '@/store';
import { adminAPI, productsAPI, shippingAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, formatDate, getStatusColor, cn } from '@/lib';
import { toast } from 'sonner';

export default function AdminDashboard({ params: { locale = 'en' } }) {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(null); // ✅ Add this state for hydration fix
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const adminT = dict?.admin || {};
  
  const { user, isAuthenticated } = useAuthStore();

  // ✅ Set current time only on client side after hydration
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router, locale]);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, topProductsRes, lowStockRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentOrders ? adminAPI.getRecentOrders({ limit: 5 }) : Promise.resolve({ data: { orders: [] } }),
        adminAPI.getTopProducts({ limit: 5 }),
        adminAPI.getLowStock({ threshold: 10 }),
      ]);
      setStats(statsRes.data.stats);
      setRecentOrders(ordersRes.data.orders || []);
      setTopProducts(topProductsRes.data.products || []);
      setLowStockProducts(lowStockRes.data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    
    const statusLabels = {
      pending: locale === 'ar' ? 'معلق' : 'Pending',
      confirmed: locale === 'ar' ? 'مؤكد' : 'Confirmed',
      processing: locale === 'ar' ? 'قيد المعالجة' : 'Processing',
      shipped: locale === 'ar' ? 'تم الشحن' : 'Shipped',
      delivered: locale === 'ar' ? 'تم التسليم' : 'Delivered',
      cancelled: locale === 'ar' ? 'ملغى' : 'Cancelled',
    };

    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusColors[status] || statusColors.pending)}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {locale === 'ar' ? 'مرحباً بك في لوحة التحكم الإدارية' : 'Welcome to your admin dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{currentTime ? currentTime.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : ''}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.orders?.total || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats?.orders?.pending || 0} {locale === 'ar' ? 'معلق' : 'pending'}
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.products?.total || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats?.products?.total_stock || 0} {locale === 'ar' ? 'في المخزون' : 'in stock'}
            </p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+5%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.users?.total || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats?.users?.customers || 0} {locale === 'ar' ? 'عملاء' : 'customers'}, {stats?.users?.traders || 0} {locale === 'ar' ? 'تجار' : 'traders'}
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+23%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {formatPrice(stats?.orders?.total_revenue || 0, locale)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {locale === 'ar' ? 'هذا الشهر' : 'This month'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}
              </h2>
              <Link 
                href={`/${locale}/admin/orders`}
                className="text-sm text-brand-red hover:text-brand-red/80 font-medium flex items-center gap-1"
              >
                {locale === 'ar' ? 'عرض الكل' : 'View All'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {locale === 'ar' ? 'العميل' : 'Customer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {locale === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {locale === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name || '-'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer_email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(order.total_amount, locale)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.created_at, locale)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'لا توجد طلبات حديثة' : 'No recent orders'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'أفضل المنتجات مبيعاً' : 'Top Selling Products'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name_en}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.total_sold} {locale === 'ar' ? 'مباع' : 'sold'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatPrice(product.total_revenue, locale)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {locale === 'ar' ? 'لا توجد بيانات مبيعات' : 'No sales data yet'}
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-900/50">
              <div className="p-6 border-b border-orange-200 dark:border-orange-900/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {locale === 'ar' ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name_en}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        {locale === 'ar' ? 'متبقي' : 'Only'} {product.stock} {locale === 'ar' ? 'قطعة' : 'left'}
                      </p>
                    </div>
                    <Link 
                      href={`/${locale}/admin/products`}
                      className="text-xs text-brand-red hover:underline"
                    >
                      {locale === 'ar' ? 'تحديث' : 'Update'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
