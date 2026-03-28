'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { ordersAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, formatDate, getStatusColor, cn } from '@/lib';
import { Navbar } from '@/components';
import { MapPin, Truck, Store, AlertCircle } from '@/components/icons';

export default function OrdersPage({ params: { locale = 'en' } }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const ordersT = dict?.orders || {};
  
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router, locale]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
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
          <h1 className="text-3xl font-bold mb-8">{ordersT.title || 'My Orders'}</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <Link href={`/${locale}/products`} className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{ordersT.orderId}: #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at, locale)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(order.status))}>
                        {ordersT[order.status] || order.status}
                      </span>
                      {order.is_large_order && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          {locale === 'ar' ? 'طلب كبير' : 'Large Order'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {/* Location and Delivery Info */}
                    {(order.city || order.delivery_method) && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex flex-wrap items-center gap-4">
                          {order.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {order.city}
                              </span>
                            </div>
                          )}
                          {order.delivery_method && (
                            <div>
                              {getDeliveryMethodBadge(order.delivery_method)}
                            </div>
                          )}
                          {order.shipping_cost > 0 && (
                            <div className="text-sm text-gray-500">
                              {locale === 'ar' ? 'تكلفة الشحن:' : 'Shipping:'} {formatPrice(order.shipping_cost, locale)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Large Order Warning */}
                    {order.is_large_order && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-700">
                              {locale === 'ar' ? 'طلب كبير' : 'Large Order'}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              {locale === 'ar' 
                                ? 'سنتواصل معك بعد تأكيد العنوان.'
                                : 'We will contact you after confirming your address.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {item.images && item.images.length > 0 ? (
                              <Image 
                                src={item.images[0]} 
                                alt={locale === 'ar' ? item.name_ar : item.name_en}
                                width={64}
                                height={64}
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">📦</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{locale === 'ar' ? item.name_ar : item.name_en}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} x {formatPrice(item.price, locale)}
                            </p>
                          </div>
                          <p className="font-semibold text-primary-600">
                            {formatPrice(item.price * item.quantity, locale)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{ordersT.total}</p>
                        <p className="text-xl font-bold text-primary-600">
                          {formatPrice(order.total_price, locale)}
                        </p>
                      </div>
                      <Link 
                        href={`/${locale}/orders/${order.id}`}
                        className="btn-secondary"
                      >
                        {ordersT.viewDetails}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
