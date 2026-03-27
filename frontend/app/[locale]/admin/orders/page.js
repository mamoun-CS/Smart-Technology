'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Search, Filter, Package, Truck, Check, X, Clock, MapPin, Store, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { ordersAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatPrice, formatDate, getStatusColor, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';

const STATUSES = {
  pending: { en: 'Pending', ar: 'معلق', color: 'bg-yellow-100 text-yellow-600' },
  confirmed: { en: 'Confirmed', ar: 'مؤكد', color: 'bg-blue-100 text-blue-600' },
  contacted: { en: 'Contacted', ar: 'تم التواصل', color: 'bg-indigo-100 text-indigo-600' },
  processing: { en: 'Processing', ar: 'قيد المعالجة', color: 'bg-blue-100 text-blue-600' },
  shipped: { en: 'Shipped', ar: 'تم الشحن', color: 'bg-purple-100 text-purple-600' },
  delivered: { en: 'Delivered', ar: 'تم التسليم', color: 'bg-green-100 text-green-600' },
  cancelled: { en: 'Cancelled', ar: 'ملغى', color: 'bg-red-100 text-red-600' },
  under_review: { en: 'Under Review', ar: 'قيد المراجعة', color: 'bg-orange-100 text-orange-600' }
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success(locale === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusInfo = STATUSES[status] || STATUSES.pending;
    return (
      <span className={cn("px-2 py-1 rounded text-xs font-medium", statusInfo.color)}>
        {locale === 'ar' ? statusInfo.ar : statusInfo.en}
      </span>
    );
  };

  const getDeliveryMethodBadge = (method) => {
    if (method === 'shipping') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600">
          <Truck className="w-3 h-3" />
          {locale === 'ar' ? 'شحن' : 'Shipping'}
        </span>
      );
    } else if (method === 'pickup') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-600">
          <Store className="w-3 h-3" />
          {locale === 'ar' ? 'استلام' : 'Pickup'}
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-20 w-full" />
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
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/admin`} className="text-primary-600 hover:underline">
                ← {locale === 'ar' ? 'العودة' : 'Back'}
              </Link>
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة الطلبات' : 'Order Management'}</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries(STATUSES).map(([status, info]) => (
              <div key={status} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{locale === 'ar' ? info.ar : info.en}</p>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === status).length}</p>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full", info.color)} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={locale === 'ar' ? 'بحث برقم الطلب أو اسم العميل...' : 'Search by order ID or customer name...'}
                className="input w-full pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full md:w-48"
            >
              <option value="all">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
              {Object.entries(STATUSES).map(([status, info]) => (
                <option key={status} value={status}>{locale === 'ar' ? info.ar : info.en}</option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'المدينة' : 'City'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'التوصيل' : 'Delivery'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.customer_name || '-'}</p>
                        <p className="text-sm text-gray-500">{order.customer_email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{order.city || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getDeliveryMethodBadge(order.delivery_method)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{formatPrice(order.total_amount, locale)}</p>
                        {order.shipping_cost > 0 && (
                          <p className="text-xs text-gray-500">
                            +{formatPrice(order.shipping_cost, locale)} {locale === 'ar' ? 'شحن' : 'shipping'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {order.is_large_order && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-600">
                            <AlertCircle className="w-3 h-3" />
                            {locale === 'ar' ? 'كبير' : 'Large'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at, locale)}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
              </div>
            )}
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {locale === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.id}
                  </h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'العميل' : 'Customer'}</p>
                      <p className="font-medium">{selectedOrder.customer_name || '-'}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer_email}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'العنوان' : 'Shipping Address'}</p>
                      <p className="font-medium">{selectedOrder.shipping_address || '-'}</p>
                      {selectedOrder.city && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{selectedOrder.city}</span>
                        </div>
                      )}
                      {selectedOrder.delivery_method && (
                        <div className="mt-1">
                          {getDeliveryMethodBadge(selectedOrder.delivery_method)}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrder.is_large_order && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-700">
                            {locale === 'ar' ? 'طلب كبير' : 'Large Order'}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            {locale === 'ar' 
                              ? 'هذا الطلب يتجاوز الحد الأقصى للطلبات التلقائية.'
                              : 'This order exceeds the automatic order limit.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">{locale === 'ar' ? 'المنتجات' : 'Items'}</h3>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} x {formatPrice(item.price, locale)}
                            </p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.price * item.quantity, locale)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>{formatPrice(selectedOrder.subtotal, locale)}</span>
                    </div>
                    {selectedOrder.shipping_cost > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">{locale === 'ar' ? 'تكلفة الشحن' : 'Shipping'}</span>
                        <span>{formatPrice(selectedOrder.shipping_cost, locale)}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                        <span>-{formatPrice(selectedOrder.discount, locale)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span>{formatPrice(selectedOrder.total_amount, locale)}</span>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Update Status */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">{locale === 'ar' ? 'تغيير الحالة' : 'Update Status'}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUSES).map(([status, info]) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          disabled={selectedOrder.status === status}
                          className={cn(
                            "px-3 py-1.5 rounded text-sm font-medium",
                            selectedOrder.status === status 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white border hover:bg-gray-50"
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
          )}
        </div>
      </div>
    </div>
  );
}
