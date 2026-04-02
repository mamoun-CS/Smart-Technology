'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Eye, Search, Filter, Package, Truck, Check, X, Clock, MapPin, Store, 
  AlertCircle, ChevronDown, MoreVertical, Phone, Mail
} from '@/components/icons';
import { useAuthStore } from '@/store';
import { ordersAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatCurrencyLabel, formatDate, getStatusColor, cn, getProductImage } from '@/lib';
import { toast } from 'sonner';

const STATUSES = {
  pending: { en: 'Pending', ar: 'معلق', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  confirmed: { en: 'Confirmed', ar: 'مؤكد', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Check },
  contacted: { en: 'Contacted', ar: 'تم التواصل', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Phone },
  processing: { en: 'Processing', ar: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
  shipped: { en: 'Shipped', ar: 'تم الشحن', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
  delivered: { en: 'Delivered', ar: 'تم التسليم', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Check },
  cancelled: { en: 'Cancelled', ar: 'ملغى', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: X },
  under_review: { en: 'Under Review', ar: 'قيد المراجعة', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle }
};

export default function OrdersManagement({ params: { locale = 'en' } }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user, router, locale]);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getAllAdmin();
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(locale === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success(locale === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_phone && order.customer_phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusInfo = STATUSES[status] || STATUSES.pending;
    const Icon = statusInfo.icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusInfo.color)}>
        <Icon className="w-3 h-3" />
        {locale === 'ar' ? statusInfo.ar : statusInfo.en}
      </span>
    );
  };

  const getDeliveryMethodBadge = (method) => {
    if (method === 'shipping') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Truck className="w-3 h-3" />
          {locale === 'ar' ? 'شحن' : 'Shipping'}
        </span>
      );
    } else if (method === 'pickup') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Store className="w-3 h-3" />
          {locale === 'ar' ? 'استلام' : 'Pickup'}
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
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
            {locale === 'ar' ? 'إدارة الطلبات' : 'Order Management'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {locale === 'ar' ? 'تتبع وإدارة جميع الطلبات' : 'Track and manage all orders'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(STATUSES).map(([status, info]) => {
          const count = orders.filter(o => o.status === status).length;
          const Icon = info.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all text-left",
                statusFilter === status 
                  ? "border-brand-red ring-2 ring-brand-red/20" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-2 rounded-lg", info.color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {locale === 'ar' ? info.ar : info.en}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث برقم الطلب أو اسم العميل أو الهاتف...' : 'Search by order ID, customer name or phone...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="all">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
              {Object.entries(STATUSES).map(([status, info]) => (
                <option key={status} value={status}>{locale === 'ar' ? info.ar : info.en}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'العميل' : 'Customer'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'المدينة' : 'City'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'التوصيل' : 'Delivery'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'الإجمالي' : 'Total'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name || '-'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer_email || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{order.city || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDeliveryMethodBadge(order.delivery_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrencyLabel(order.total_amount, locale)}
                        </p>
                        {order.shipping_cost > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{formatCurrencyLabel(order.shipping_cost, locale)} {locale === 'ar' ? 'شحن' : 'shipping'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {order.is_large_order && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            <AlertCircle className="w-3 h-3" />
                            {locale === 'ar' ? 'كبير' : 'Large'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at, locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        {locale === 'ar' ? 'عرض' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {locale === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.id}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(selectedOrder.created_at, locale)}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {locale === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{locale === 'ar' ? 'الاسم:' : 'Name:'}</span> {selectedOrder.customer_name || '-'}
                      </p>
                      {selectedOrder.customer_email && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedOrder.customer_email}
                        </p>
                      )}
                      {selectedOrder.customer_phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {selectedOrder.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {locale === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{locale === 'ar' ? 'العنوان:' : 'Address:'}</span> {selectedOrder.shipping_address || '-'}
                      </p>
                      {selectedOrder.city && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {selectedOrder.city}
                        </p>
                      )}
                      <div className="mt-2">
                        {getDeliveryMethodBadge(selectedOrder.delivery_method)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Large Order Warning */}
                {selectedOrder.is_large_order && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                          {locale === 'ar' ? 'طلب كبير' : 'Large Order'}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                          {locale === 'ar' 
                            ? 'هذا الطلب يتجاوز الحد الأقصى للطلبات التلقائية.'
                            : 'This order exceeds the automatic order limit.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {locale === 'ar' ? 'المنتجات' : 'Order Items'}
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl divide-y divide-gray-200 dark:divide-gray-600">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          {item.images && item.images.length > 0 && getProductImage(item.images) ? (
                            <img 
                              src={getProductImage(item.images)} 
                              alt={locale === 'ar' ? item.name_ar : item.name_en}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {locale === 'ar' ? item.name_ar : item.name_en}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.quantity} x {formatCurrencyLabel(item.price, locale)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrencyLabel(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrencyLabel(selectedOrder.subtotal, locale)}</span>
                    </div>
                    {selectedOrder.shipping_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{locale === 'ar' ? 'تكلفة الشحن' : 'Shipping'}</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrencyLabel(selectedOrder.shipping_cost, locale)}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                        <span>-{formatCurrencyLabel(selectedOrder.discount, locale)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <span className="text-gray-900 dark:text-white">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrencyLabel(selectedOrder.total_amount, locale)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Update Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {locale === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUSES).map(([status, info]) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          selectedOrder.status === status 
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        )}
                      >
                        {locale === 'ar' ? info.ar : info.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
