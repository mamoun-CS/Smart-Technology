'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, AlertCircle, MapPin, Truck, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { getDictionary } from '../../../i18n';
import { formatPrice, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/ui/Footer';
import Button from '../../../components/ui/Button';

export default function CartPage({ params: { locale = 'en' } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [shippingCost, setShippingCost] = useState(null);
  const [isLargeOrder, setIsLargeOrder] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const cartT = dict?.cart || {};
  
  const { items, total, fetchCart, updateItem, removeItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Available cities (from shipping areas)
  const cities = [
    { id: 'ramallah', name_en: 'Ramallah', name_ar: 'رام الله' },
    { id: 'nablus', name_en: 'Nablus', name_ar: 'نابلس' },
    { id: 'hebron', name_en: 'Hebron', name_ar: 'الخليل' },
    { id: 'gaza', name_en: 'Gaza Strip', name_ar: 'قطاع غزة' },
    { id: 'jerusalem', name_en: 'Jerusalem', name_ar: 'القدس' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
    setIsLoading(false);
  }, [isAuthenticated, fetchCart]);

  // Calculate shipping when city or delivery method changes
  useEffect(() => {
    const calculateShipping = async () => {
      if (!selectedCity || !deliveryMethod) {
        setShippingCost(null);
        return;
      }

      setIsCalculatingShipping(true);
      try {
        const response = await fetch(
          `/api/orders/calculate/shipping?city=${encodeURIComponent(selectedCity)}&delivery_method=${deliveryMethod}`
        );
        const data = await response.json();
        
        if (data.success) {
          setShippingCost(data.shipping_cost);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    calculateShipping();
  }, [selectedCity, deliveryMethod]);

  // Check if order is large
  useEffect(() => {
    const checkLargeOrder = async () => {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      
      if (totalQuantity > 0) {
        try {
          const response = await fetch(
            `/api/orders/check/large-order?total_quantity=${totalQuantity}`
          );
          const data = await response.json();
          
          if (data.success) {
            setIsLargeOrder(data.is_large_order);
          }
        } catch (error) {
          console.error('Error checking large order:', error);
        }
      }
    };

    checkLargeOrder();
  }, [items]);

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
    
    if (!selectedCity || !deliveryMethod) {
      toast.error(locale === 'ar' ? 'الرجاء اختيار المدينة وطريقة التوصيل' : 'Please select city and delivery method');
      return;
    }
    
    if (isLargeOrder) {
      toast.info(locale === 'ar' ? 'طلبك كبير. سنتواصل معك بعد تأكيد العنوان' : 'Your order is large. We will contact you after confirming your address.');
    }
    
    router.push(`/${locale}/checkout?city=${encodeURIComponent(selectedCity)}&delivery_method=${deliveryMethod}`);
  };

  // Calculate totals
  const subtotal = total || 0;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = shippingCost !== null ? subtotal + shippingCost : subtotal;

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="container-custom">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 flex gap-4 bg-dark-800 border-dark-600">
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
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-dark-900">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {cartT.title || 'Shopping Cart'}
          </h1>
          <p className="text-gray-400 mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="pb-12">
        <div className="container-custom">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-dark-800 rounded-xl border border-dark-600">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {cartT.empty || 'Your cart is empty'}
              </h2>
              <p className="text-gray-400 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href={`/${locale}/products`}>
                <Button>
                  {cartT.continueShopping || 'Continue Shopping'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="flex-1">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="card p-4 flex gap-4 bg-dark-800 border-dark-600">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-dark-700 rounded-lg overflow-hidden">
                        {item.images?.[0] ? (
                          <Image 
                            src={item.images[0]} 
                            alt={locale === 'ar' ? item.name_ar : item.name_en}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-3xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white line-clamp-1">
                          {locale === 'ar' ? item.name_ar : item.name_en}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-brand-red font-bold">
                            {formatPrice(item.price, locale)}
                          </p>
                          {item.is_wholesale_applied && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              {locale === 'ar' ? 'جملة' : 'Wholesale'}
                            </span>
                          )}
                        </div>
                        
                        {/* Wholesale pricing info */}
                        {item.wholesale_price && item.min_order_quantity && (
                          <div className="mt-2 text-xs">
                            {item.is_wholesale_applied ? (
                              <div className="flex items-center gap-1 text-green-400">
                                <Check className="w-3 h-3" />
                                <span>{locale === 'ar' ? 'لقد حصلت على سعر الجملة' : 'You received the wholesale price'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>
                                  {locale === 'ar' 
                                    ? `اشترِ ${item.min_order_quantity - item.quantity} قطع إضافية للحصول على الخصم`
                                    : `Buy ${item.min_order_quantity - item.quantity} more to get a discount`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-300" />
                            </button>
                            <span className="w-10 text-center font-medium text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-300" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
                <div className="card p-6 sticky top-24 bg-dark-800 border-dark-600">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    {dict?.checkout?.orderSummary || 'Order Summary'}
                  </h2>
                  
                  {/* Location Selection */}
                  <div className="mb-6 p-4 bg-dark-700 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {locale === 'ar' ? 'اختر الموقع' : 'Select Location'}
                    </h3>
                    
                    {/* City Selection */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-400 mb-2">
                        {locale === 'ar' ? 'المدينة' : 'City'}
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full p-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      >
                        <option value="">
                          {locale === 'ar' ? 'اختر المدينة' : 'Select City'}
                        </option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.name_en}>
                            {locale === 'ar' ? city.name_ar : city.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Delivery Method */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        {locale === 'ar' ? 'طريقة التوصيل' : 'Delivery Method'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setDeliveryMethod('shipping')}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                            deliveryMethod === 'shipping'
                              ? "border-brand-red bg-brand-red/10"
                              : "border-dark-500 hover:border-dark-400"
                          )}
                        >
                          <Truck className={cn(
                            "w-5 h-5",
                            deliveryMethod === 'shipping' ? "text-brand-red" : "text-gray-400"
                          )} />
                          <span className={cn(
                            "text-xs font-medium",
                            deliveryMethod === 'shipping' ? "text-white" : "text-gray-400"
                          )}>
                            {locale === 'ar' ? 'شحن' : 'Shipping'}
                          </span>
                        </button>
                        <button
                          onClick={() => setDeliveryMethod('pickup')}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                            deliveryMethod === 'pickup'
                              ? "border-brand-red bg-brand-red/10"
                              : "border-dark-500 hover:border-dark-400"
                          )}
                        >
                          <Store className={cn(
                            "w-5 h-5",
                            deliveryMethod === 'pickup' ? "text-brand-red" : "text-gray-400"
                          )} />
                          <span className={cn(
                            "text-xs font-medium",
                            deliveryMethod === 'pickup' ? "text-white" : "text-gray-400"
                          )}>
                            {locale === 'ar' ? 'استلام من المتجر' : 'In-Store Pickup'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{cartT.subtotal || 'Subtotal'}</span>
                      <span className="font-semibold text-white">{formatPrice(subtotal, locale)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">{cartT.shipping || 'Shipping'}</span>
                      <span className="font-semibold text-white">
                        {isCalculatingShipping ? (
                          <span className="text-gray-500">
                            {locale === 'ar' ? 'جاري الحساب...' : 'Calculating...'}
                          </span>
                        ) : shippingCost !== null ? (
                          shippingCost === 0 ? (
                            <span className="text-green-400">
                              {locale === 'ar' ? 'مجاني' : 'Free'}
                            </span>
                          ) : (
                            formatPrice(shippingCost, locale)
                          )
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {locale === 'ar' ? 'اختر الموقع أولاً' : 'Select location first'}
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="border-t border-dark-600 pt-4 flex justify-between">
                      <span className="font-semibold text-white">{cartT.total || 'Total'}</span>
                      <span className="font-bold text-xl text-brand-red">
                        {shippingCost !== null ? (
                          formatPrice(grandTotal, locale)
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {locale === 'ar' ? '—' : '—'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Large Order Warning */}
                  {isLargeOrder && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-400">
                            {locale === 'ar' ? 'طلب كبير' : 'Large Order'}
                          </p>
                          <p className="text-xs text-yellow-300 mt-1">
                            {locale === 'ar' 
                              ? 'سنتواصل معك بعد تأكيد العنوان. لن يتم إتمام الدفع تلقائياً.'
                              : 'We will contact you after confirming your address. Direct payment will not be completed automatically.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Shipping Not Calculated Warning */}
                  {shippingCost === null && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-400">
                            {locale === 'ar' ? 'التكلفة غير محسوبة' : 'Cost Not Calculated'}
                          </p>
                          <p className="text-xs text-blue-300 mt-1">
                            {locale === 'ar' 
                              ? 'الرجاء اختيار المدينة وطريقة التوصيل لعرض السعر النهائي.'
                              : 'Please select city and delivery method to view the final price.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    fullWidth 
                    onClick={handleCheckout}
                    className="mt-2"
                    disabled={!selectedCity || !deliveryMethod || isCalculatingShipping}
                  >
                    {isLargeOrder ? (
                      <>
                        {locale === 'ar' ? 'تقديم الطلب للمراجعة' : 'Submit for Review'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        {cartT.checkout || 'Proceed to Checkout'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer locale={locale} dict={dict} />
    </div>
  );
}
