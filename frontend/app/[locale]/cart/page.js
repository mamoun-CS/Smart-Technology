'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { getDictionary } from '../../../i18n';
import { formatPrice, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';

export default function CartPage({ params: { locale = 'en' } }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const cartT = dict?.cart || {};
  
  const { items, total, fetchCart, updateItem, removeItem, clearCart, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
    setIsLoading(false);
  }, [isAuthenticated, fetchCart]);

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateItem(productId, quantity);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    router.push(`/${locale}/checkout`);
  };

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 flex gap-4">
                  <div className="skeleton h-24 w-24" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
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
          <h1 className="text-3xl font-bold mb-8">{cartT.title || 'Shopping Cart'}</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{cartT.empty || 'Your cart is empty'}</h2>
              <Link href={`/${locale}/products`} className="btn-primary inline-flex items-center gap-2">
                {cartT.continueShopping || 'Continue Shopping'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="flex-1">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="card p-4 flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {item.images?.[0] ? (
                          <Image 
                            src={item.images[0]} 
                            alt={locale === 'ar' ? item.name_ar : item.name_en}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {locale === 'ar' ? item.name_ar : item.name_en}
                        </h3>
                        <p className="text-primary-600 font-bold mt-1">
                          {formatPrice(item.price, locale)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96">
                <div className="card p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-4">{dict?.checkout?.orderSummary || 'Order Summary'}</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{cartT.subtotal || 'Subtotal'}</span>
                      <span className="font-semibold">{formatPrice(total, locale)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{cartT.shipping || 'Shipping'}</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{cartT.tax || 'Tax'}</span>
                      <span className="font-semibold">{formatPrice(total * 0.1, locale)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold">{cartT.total || 'Total'}</span>
                      <span className="font-bold text-lg text-primary-600">
                        {formatPrice(total * 1.1, locale)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {cartT.checkout || 'Proceed to Checkout'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}