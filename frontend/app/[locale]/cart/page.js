'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { cartAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, cn } from '@/lib';
import { toast } from 'sonner';
import { Navbar } from '@/components';
import { Footer } from '@/components';
import { Button } from '@/components';
import { Loading } from '@/components';
import { Tooltip } from '@/components';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Info, Tag } from '@/components/icons';

export default function CartPage({ params: { locale = 'en' } }) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const cartT = dict?.cart || {};
  
  const { user, isAuthenticated } = useAuthStore();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(locale === 'ar' ? 'فشل تحميل السلة' : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItemId(productId);
      await cartAPI.updateItem(productId, newQuantity);
      await fetchCart();
      toast.success(locale === 'ar' ? 'تم تحديث الكمية' : 'Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(locale === 'ar' ? 'فشل تحديث الكمية' : 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setUpdatingItemId(productId);
      await cartAPI.removeItem(productId);
      await fetchCart();
      toast.success(locale === 'ar' ? 'تمت الإزالة من السلة' : 'Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(locale === 'ar' ? 'فشل إزالة المنتج' : 'Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    router.push(`/${locale}/checkout`);
  };

  // Check if user can see wholesale price
  const canSeeWholesalePrice = user?.role === 'admin' || user?.role === 'merchant';
  const isCustomer = user?.role === 'customer' || !user?.role;

  // Calculate totals
  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = canSeeWholesalePrice && item.wholesale_price && item.quantity >= (item.min_order_quantity || 1)
        ? item.wholesale_price
        : (item.unit_price || item.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateSavings = () => {
    if (!cart?.items || !canSeeWholesalePrice) return 0;
    return cart.items.reduce((total, item) => {
      if (item.wholesale_price && item.quantity >= (item.min_order_quantity || 1)) {
        const retailTotal = (item.unit_price || item.price) * item.quantity;
        const wholesaleTotal = item.wholesale_price * item.quantity;
        return total + (retailTotal - wholesaleTotal);
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {locale === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {locale === 'ar' 
                ? 'قم بتسجيل الدخول لعرض سلة التسوق الخاصة بك'
                : 'Sign in to view your cart'
              }
            </p>
            <Button onClick={() => router.push(`/${locale}/login`)}>
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {locale === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {locale === 'ar' 
                ? 'ابدأ التسوق لإضافة منتجات إلى سلتك'
                : 'Start shopping to add items to your cart'
              }
            </p>
            <Button onClick={() => router.push(`/${locale}/products`)}>
              {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {locale === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const itemPrice = canSeeWholesalePrice && item.wholesale_price && item.quantity >= (item.min_order_quantity || 1)
                  ? item.wholesale_price
                  : (item.unit_price || item.price);
                const isWholesaleApplied = canSeeWholesalePrice && item.wholesale_price && item.quantity >= (item.min_order_quantity || 1);
                
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={locale === 'ar' ? item.name_ar : item.name_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {locale === 'ar' ? item.name_ar : item.name_en}
                        </h3>
                        
                        {/* Price Display */}
                        <div className="mt-2 space-y-1">
                          {/* Retail Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              {locale === 'ar' ? 'سعر التجزئة:' : 'Retail:'}
                            </span>
                            <span className={cn(
                              "font-medium",
                              isWholesaleApplied ? "line-through text-gray-400" : "text-gray-900 dark:text-white"
                            )}>
                              {formatPrice(item.unit_price || item.price, locale)}
                            </span>
                          </div>
                          
                          {/* Wholesale Price - Only for merchants/admins */}
                          {canSeeWholesalePrice && item.wholesale_price && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                {locale === 'ar' ? 'سعر الجملة:' : 'Wholesale:'}
                              </span>
                              <span className={cn(
                                "font-medium",
                                isWholesaleApplied ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
                              )}>
                                {formatPrice(item.wholesale_price, locale)}
                              </span>
                              {item.min_order_quantity && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  (min: {item.min_order_quantity})
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Applied Price */}
                          <div className="flex items-center gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              {locale === 'ar' ? 'السعر المطبق:' : 'Applied:'}
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatPrice(itemPrice, locale)}
                            </span>
                            {isWholesaleApplied && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                                {locale === 'ar' ? 'جملة' : 'Wholesale'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                              disabled={updatingItemId === item.product_id || item.quantity <= 1}
                              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-1 text-gray-900 dark:text-white font-medium min-w-[50px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                              disabled={updatingItemId === item.product_id}
                              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            disabled={updatingItemId === item.product_id}
                            className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Wholesale Info for Customers */}
                        {isCustomer && item.wholesale_price && (
                          <Tooltip
                            content={locale === 'ar' 
                              ? 'أسعار الجملة متاحة فقط للتجار. قم بتسجيل الدخول كتاجر للحصول على أسعار الجملة.'
                              : 'Wholesale prices are only available for merchants. Sign in as a merchant to get wholesale prices.'
                            }
                          >
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-help">
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  {locale === 'ar' 
                                    ? 'أسعار الجملة متاحة للتجار. سجل كتاجر للحصول على أسعار أفضل.'
                                    : 'Wholesale prices available for merchants. Register as a merchant for better prices.'
                                  }
                                </p>
                              </div>
                            </div>
                          </Tooltip>
                        )}

                        {/* Wholesale Progress for Merchants/Admins */}
                        {canSeeWholesalePrice && item.wholesale_price && item.min_order_quantity && item.quantity < item.min_order_quantity && (
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Tag className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                {locale === 'ar' 
                                  ? `أضف ${item.min_order_quantity - item.quantity} قطع إضافية للحصول على سعر الجملة`
                                  : `Add ${item.min_order_quantity - item.quantity} more units to get wholesale price`
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>

                  {/* Savings (for merchants/admins) */}
                  {canSeeWholesalePrice && savings > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {locale === 'ar' ? 'التوفير' : 'Savings'}
                      </span>
                      <span className="font-medium">
                        -{formatPrice(savings, locale)}
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {locale === 'ar' ? 'الشحن' : 'Shipping'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {locale === 'ar' ? 'يحسب عند الدفع' : 'Calculated at checkout'}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {locale === 'ar' ? 'الإجمالي' : 'Total'}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>

                  {/* Wholesale Info Box for Customers */}
                  {isCustomer && (
                    <Tooltip
                      content={locale === 'ar' 
                        ? 'بتسجيل الدخول كتاجر، يمكنك الوصول إلى أسعار الجملة والخصومات الحصرية على الكميات.'
                        : 'By signing in as a merchant, you can access wholesale prices and exclusive quantity discounts.'
                      }
                    >
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-help">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                              {locale === 'ar' ? 'هل أنت تاجر؟' : 'Are you a merchant?'}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {locale === 'ar' 
                                ? 'سجل كتاجر للحصول على أسعار الجملة والخصومات الحصرية.'
                                : 'Register as a merchant to get wholesale prices and exclusive discounts.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  )}

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {locale === 'ar' ? 'متابعة الدفع' : 'Proceed to Checkout'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer locale={locale} dict={dict} />
    </div>
  );
}
