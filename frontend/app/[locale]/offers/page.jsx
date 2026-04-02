'use client';

import { useState, useEffect } from 'react';
import { Tag, Gift, Percent, DollarSign, Calendar, Users, Copy, Check } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { offersAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatCurrencyLabel, formatDate, cn } from '@/lib';
import { toast } from 'sonner';
import { Navbar } from '@/components';

export default function OffersPage({ params: { locale = 'en' } }) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchOffers();
  }, [isAuthenticated, router, locale]);

  const fetchOffers = async () => {
    try {
      const response = await offersAPI.getActive();
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const response = await offersAPI.validate({ 
        code: couponCode, 
        order_total: 100 // Placeholder - would use actual cart total
      });
      setAppliedOffer(response.data);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setAppliedOffer(null);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="skeleton h-48 w-full mb-4" />
            <div className="skeleton h-48 w-full" />
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
          <h1 className="text-3xl font-bold mb-8">Special Offers & Coupons</h1>

          {/* Coupon Input Section */}
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Have a coupon code?</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="input flex-1"
              />
              <button 
                onClick={handleApplyCoupon}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
            {appliedOffer && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    {appliedOffer.offer.discount_type === 'percentage' 
                      ? `${appliedOffer.offer.discount_value}% off applied!`
                      : `${formatCurrencyLabel(appliedOffer.discount, locale)} off applied!`
                    }
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  New total: {formatCurrencyLabel(appliedOffer.final_total, locale)}
                </p>
              </div>
            )}
          </div>

          {/* Available Offers */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Available Offers for You
            </h2>
            {offers.length === 0 ? (
              <div className="card p-8 text-center">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active offers available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="card p-6 border-2 border-dashed border-primary-200 hover:border-primary-400 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        {offer.discount_type === 'percentage' ? (
                          <Percent className="w-6 h-6 text-primary-600" />
                        ) : (
                          <DollarSign className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(offer.code)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        {copiedCode === offer.code ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-primary-600 mb-2">{offer.code}</h3>
                    <p className="text-lg font-semibold mb-4">
                      {offer.discount_type === 'percentage' 
                        ? `${offer.discount_value}% OFF`
                        : `${formatCurrencyLabel(offer.discount_value, locale)} OFF`
                      }
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Valid until {formatDate(offer.valid_until, locale)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {offer.target_role === 'all' 
                            ? 'Everyone' 
                            : `For ${offer.target_role}s only`
                          }
                        </span>
                      </div>
                      {offer.usage_limit && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          <span>{offer.used_count}/{offer.usage_limit} used</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setCouponCode(offer.code);
                        copyToClipboard(offer.code);
                      }}
                      className="w-full btn-primary"
                    >
                      Use This Code
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How to use */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">How to use coupons</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Browse available offers and find one that suits you</li>
              <li>Copy the coupon code or click "Use This Code"</li>
              <li>Enter the code in the coupon input box during checkout</li>
              <li>Your discount will be applied to your order total</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}