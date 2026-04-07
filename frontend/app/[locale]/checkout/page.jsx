'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CreditCard, MapPin, Truck, Store, AlertCircle, Check } from '@/components/icons';
import { useCartStore } from '@/store';
import { useAuthStore } from '@/store';
import { getDictionary } from '@/i18n';
import { formatCurrencyLabel, cn, getProductImage, ordersAPI, isValidPhoneNumber, validateCheckoutForm, isAdmin, canAccessCheckout } from '@/lib';
import { toast } from 'sonner';
import { Navbar } from '@/components';
import { Footer } from '@/components';
import { Button } from '@/components';
import { Input } from '@/components';

function CheckoutContent({ locale = 'en' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const cartT = dict?.cart || {};
  const checkoutT = dict?.checkout || {};
  
  const { items, total, fetchCart, clearCart, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const [isLargeOrder, setIsLargeOrder] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Get city and delivery method from URL params
  const city = searchParams.get('city') || '';
  const deliveryMethod = searchParams.get('delivery_method') || '';
  
  // Form state - include full_name and phone from user profile
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    shipping_address: '',
    payment_method: 'credit_card'
  });

  // Validate form and check if submit should be enabled
  const isFormValid = () => {
    const validation = validateCheckoutForm(formData, locale, deliveryMethod);
    setErrors(validation.errors);
    return validation.isValid;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    
    // Check if user is admin - redirect to admin dashboard
    if (isAdmin(user)) {
      router.push(`/${locale}/admin`);
      return;
    }
    
    // Check if user is not a customer
    if (!canAccessCheckout(user)) {
      router.push(`/${locale}/admin`);
      return;
    }
    
    if (items.length === 0) {
      router.push(`/${locale}/cart`);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      full_name: user?.name || prev.full_name,
      phone: user?.phone || prev.phone
    }));
    
    fetchCart();
    setIsLoading(false);
  }, [isAuthenticated, user, items.length, fetchCart, router, locale]);

  // Calculate shipping and check large order
  useEffect(() => {
    const calculateDetails = async () => {
      // Check if large order even without shipping info
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      try {
        const largeOrderResponse = await ordersAPI.checkLargeOrder(totalQuantity);
        const largeOrderData = largeOrderResponse.data;
        
        if (largeOrderData.success) {
          setIsLargeOrder(largeOrderData.is_large_order);
        }
      } catch (error) {
        console.error('Error checking large order:', error);
      }
      
      // Calculate shipping only if city and delivery method are provided
      if (!city || !deliveryMethod) return;
      
      try {
        const shippingResponse = await ordersAPI.calculateShipping(city, deliveryMethod);
        const shippingData = shippingResponse.data;
        
        if (shippingData.success) {
          setShippingCost(shippingData.shipping_cost);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
      }
    };
    
    calculateDetails();
  }, [city, deliveryMethod, items]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields before submitting
    if (!isFormValid()) {
      toast.error(locale === 'ar' ? 'الرجاء إكمال جميع الحقول المطلوبة' : 'Please complete all required fields');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const orderData = {
        full_name: formData.full_name,
        phone: formData.phone,
        payment_method: formData.payment_method,
      };
      
      // Only include shipping_address if not pickup
      if (deliveryMethod !== 'pickup') {
        orderData.shipping_address = formData.shipping_address;
      }
      
      // Only include city and delivery_method if they are provided
      if (city) orderData.city = city;
      if (deliveryMethod) orderData.delivery_method = deliveryMethod;
      
      const response = await ordersAPI.create(orderData);
      const data = response.data;
      
      if (data.success) {
        await clearCart();
        
        if (isLargeOrder) {
          toast.success(locale === 'ar' 
            ? 'تم تقديم طلبك بنجاح. سنتواصل معك بعد تأكيد العنوان.'
            : 'Order submitted successfully. We will contact you after confirming your address.'
          );
        } else {
          toast.success(locale === 'ar' ? 'تم تقديم طلبك بنجاح' : 'Order placed successfully');
        }
        
        router.push(`/${locale}/orders`);
      } else {
        toast.error(data.message || (locale === 'ar' ? 'فشل في تقديم الطلب' : 'Failed to place order'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || (locale === 'ar' ? 'حدث خطأ أثناء تقديم الطلب' : 'Error placing order');
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate totals
  const subtotal = total || 0;
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
          <button
            onClick={() => router.push(`/${locale}/cart`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'ar' ? 'العودة إلى السلة' : 'Back to Cart'}
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {checkoutT.title || 'Checkout'}
          </h1>
        </div>
      </div>

      <div className="pb-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="card p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h3 className="text-red-400 font-medium mb-2">
                      {locale === 'ar' ? 'الرجاء إكمال جميع الحقول المطلوبة' : 'Please fill in all the required fields'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="text-gray-400">{locale === 'ar' ? 'الاسم:' : 'Name:'}</span> {formData.full_name || '—'}</p>
                      <p><span className="text-gray-400">{locale === 'ar' ? 'الهاتف:' : 'Phone:'}</span> {formData.phone || '—'}</p>
                      {deliveryMethod !== 'pickup' && (
                        <p><span className="text-gray-400">{locale === 'ar' ? 'العنوان:' : 'Address:'}</span> {formData.shipping_address || '—'}</p>
                      )}
                      <p><span className="text-gray-400">{locale === 'ar' ? 'الدفع:' : 'Payment:'}</span> {formData.payment_method === 'credit_card' ? (locale === 'ar' ? 'بطاقة ائتمان' : 'Credit Card') : (locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery')}</p>
                    </div>
                  </div>
                )}
                {/* Location Summary */}
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-red" />
                    {locale === 'ar' ? 'ملخص الموقع' : 'Location Summary'}
                  </h2>
                  
                  {city && deliveryMethod ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-dark-700 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">
                          {locale === 'ar' ? 'المدينة' : 'City'}
                        </p>
                        <p className="text-white font-medium">{city}</p>
                      </div>
                      <div className="p-4 bg-dark-700 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">
                          {locale === 'ar' ? 'طريقة التوصيل' : 'Delivery Method'}
                        </p>
                        <div className="flex items-center gap-2">
                          {deliveryMethod === 'shipping' ? (
                            <>
                              <Truck className="w-4 h-4 text-brand-red" />
                              <span className="text-white font-medium">
                                {locale === 'ar' ? 'شحن' : 'Shipping'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Store className="w-4 h-4 text-brand-red" />
                              <span className="text-white font-medium">
                                {locale === 'ar' ? 'استلام من المتجر' : 'In-Store Pickup'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <p className="text-sm text-gray-400">
                        {locale === 'ar' 
                          ? 'لم يتم تحديد المدينة وطريقة التوصيل. يمكنك إكمال الطلب وسيتم التواصل معك لتأكيد التفاصيل.'
                          : 'City and delivery method not selected. You can complete your order and we will contact you to confirm the details.'
                        }
                      </p>
                    </div>
                  )}
</div>

                {/* Customer Information */}
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-red" />
                    {locale === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        {locale === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-red"
                        required
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                      )}
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        {locale === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={locale === 'ar' ? '+970599123456' : '+970599123456'}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-red"
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address - Only show if not pickup */}
                {deliveryMethod !== 'pickup' && (
                  <div className="card p-6 bg-dark-800 border-dark-600">
                    <h2 className="text-lg font-semibold text-white mb-4">
                      {locale === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                    </h2>
                    
                    <Input
                      label={locale === 'ar' ? 'العنوان الكامل' : 'Full Address'}
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder={locale === 'ar' 
                        ? 'أدخل عنوان الشحن الكامل...'
                        : 'Enter your full shipping address...'
                      }
                      required={deliveryMethod !== 'pickup'}
                      error={errors.shipping_address}
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div className="card p-6 bg-dark-800 border-dark-600">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-red" />
                    {locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </h2>
                  
                  {isLargeOrder ? (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-400">
                            {locale === 'ar' ? 'الدفع غير متاح' : 'Payment Not Available'}
                          </p>
                          <p className="text-xs text-yellow-300 mt-1">
                            {locale === 'ar' 
                              ? 'طلبك كبير. سنتواصل معك بعد تأكيد العنوان لإتمام الدفع.'
                              : 'Your order is large. We will contact you after confirming your address to complete payment.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                        <input
                          type="radio"
                          name="payment_method"
                          value="credit_card"
                          checked={formData.payment_method === 'credit_card'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-brand-red"
                        />
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-white">
                          {locale === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cash_on_delivery"
                          checked={formData.payment_method === 'cash_on_delivery'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-brand-red"
                        />
                        <span className="text-white">
                          {locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Large Order Warning */}
                {isLargeOrder && (
                  <div className="card p-6 bg-dark-800 border-dark-600">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-400">
                            {locale === 'ar' ? 'طلب كبير - مراجعة يدوية' : 'Large Order - Manual Review'}
                          </p>
                          <p className="text-xs text-yellow-300 mt-1">
                            {locale === 'ar' 
                              ? 'طلبك يتجاوز الحد الأقصى للطلبات التلقائية. سنتواصل معك بعد تأكيد العنوان.'
                              : 'Your order exceeds the automatic order limit. We will contact you after confirming your address.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  disabled={isProcessing || isLargeOrder || !formData.full_name || !formData.phone || !formData.payment_method}
                  className="mt-6"
                >
                  {isProcessing ? (
                    <>
                      {locale === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                  ) : isLargeOrder ? (
                    <>
                      {locale === 'ar' ? 'تقديم الطلب للمراجعة' : 'Submit for Review'}
                    </>
                  ) : (
                    <>
                      {locale === 'ar' ? 'إتمام الطلب' : 'Place Order'}
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96">
              <div className="card p-6 sticky top-24 bg-dark-800 border-dark-600">
                <h2 className="text-lg font-semibold text-white mb-6">
                  {checkoutT.orderSummary || 'Order Summary'}
                </h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-dark-700 rounded-lg overflow-hidden">
                        {item.images?.[0] && getProductImage(item.images) ? (
                          <Image 
                            src={getProductImage(item.images)} 
                            alt={locale === 'ar' ? item.name_ar : item.name_en}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white line-clamp-1">
                          {locale === 'ar' ? item.name_ar : item.name_en}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {locale === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-brand-red">
                          {formatCurrencyLabel(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-4 border-t border-dark-600 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{cartT.subtotal || 'Subtotal'}</span>
                    <span className="font-semibold text-white">{formatCurrencyLabel(subtotal, locale)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">{cartT.shipping || 'Shipping'}</span>
                    <span className="font-semibold text-white">
                      {shippingCost !== null ? (
                        shippingCost === 0 ? (
                          <span className="text-green-400">
                            {locale === 'ar' ? 'مجاني' : 'Free'}
                          </span>
                        ) : (
                          formatCurrencyLabel(shippingCost, locale)
                        )
                      ) : city && deliveryMethod ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="text-gray-500">
                          {locale === 'ar' ? 'سيتم احتسابه' : 'TBD'}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t border-dark-600 pt-4 flex justify-between">
                    <span className="font-semibold text-white">{cartT.total || 'Total'}</span>
                    <span className="font-bold text-xl text-brand-red">
                      {formatCurrencyLabel(grandTotal, locale)}
                    </span>
                  </div>
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

export default function CheckoutPage({ params: { locale = 'en' } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CheckoutContent locale={locale} />
    </Suspense>
  );
}
