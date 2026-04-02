'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { ordersAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatCurrencyLabel, formatDate, getStatusColor, cn, getProductImage } from '@/lib';
import { Navbar } from '@/components';
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from '@/components/icons';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';
  const orderId = params?.id;
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const ordersT = dict?.orders || {};
  
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchOrder();
  }, [isAuthenticated, orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getOne(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'ar' ? 'خطأ في تحميل الطلب' : 'Error Loading Order'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Link
                href={`/${locale}/orders`}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="w-4 h-4" />
                {locale === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/${locale}/orders`}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}: #{order.id?.slice(0, 8)}
            </p>
          </div>

          {/* Order Status & Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'الحالة' : 'Status'}
                    </p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      getStatusColor(order.status)
                    )}>
                      {ordersT[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {locale === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(order.created_at, locale)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {locale === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-900 dark:text-white">
                    <span className="text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'الطريقة' : 'Method'}: 
                    </span>{' '}
                    {order.delivery_method === 'shipping' 
                      ? (locale === 'ar' ? 'شحن' : 'Shipping')
                      : (locale === 'ar' ? 'استلام من المتجر' : 'Store Pickup')
                    }
                  </p>
                  {order.city && (
                    <p className="text-gray-900 dark:text-white flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {locale === 'ar' ? 'المدينة' : 'City'}: 
                        </span>{' '}
                        {order.city}
                      </span>
                    </p>
                  )}
                  {order.shipping_address && (
                    <p className="text-gray-900 dark:text-white">
                      <span className="text-gray-500 dark:text-gray-400">
                        {locale === 'ar' ? 'العنوان' : 'Address'}: 
                      </span>{' '}
                      {order.shipping_address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  {locale === 'ar' ? 'معلومات الدفع' : 'Payment Information'}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-900 dark:text-white">
                    <span className="text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'الطريقة' : 'Method'}: 
                    </span>{' '}
                    {order.payment_method || (locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
                  </p>
                  {order.shipping_cost > 0 && (
                    <p className="text-gray-900 dark:text-white">
                      <span className="text-gray-500 dark:text-gray-400">
                        {locale === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}: 
                      </span>{' '}
                      {formatCurrencyLabel(order.shipping_cost, locale)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                {locale === 'ar' ? 'المنتجات' : 'Products'} ({order.items?.length || 0})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items?.map((item, index) => (
                <div key={item.id || index} className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {item.images && item.images[0] && getProductImage(item.images) ? (
                        <Image
                          src={getProductImage(item.images)}
                          alt={locale === 'ar' ? item.name_ar : item.name_en}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {locale === 'ar' ? item.name_ar : item.name_en}
                      </h3>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">
                            {locale === 'ar' ? 'السعر للوحدة' : 'Unit Price'}:
                          </span>{' '}
                          {formatCurrencyLabel(item.price, locale)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">
                            {locale === 'ar' ? 'الكمية' : 'Quantity'}:
                          </span>{' '}
                          {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <span>
                            {locale === 'ar' ? 'السعر المطبق' : 'Applied Price'}:
                          </span>{' '}
                          {formatCurrencyLabel(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrencyLabel(item.price * item.quantity, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>
                    {formatCurrencyLabel(
                      order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
                      locale
                    )}
                  </span>
                </div>
                
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{locale === 'ar' ? 'تكلفة الشحن' : 'Shipping'}</span>
                    <span>{formatCurrencyLabel(order.shipping_cost, locale)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span>{formatCurrencyLabel(order.total_price, locale)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
