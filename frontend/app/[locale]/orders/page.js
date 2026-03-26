'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { ordersAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatPrice, formatDate, getStatusColor, cn } from '../../../lib/utils';
import Navbar from '../../../components/Navbar';

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
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(order.status))}>
                      {ordersT[order.status] || order.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {item.images?.[0] ? (
                              <Image 
                                src={item.images[0]} 
                                alt={item.name_en}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">📦</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{locale === 'ar' ? item.name_ar : item.name_en}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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