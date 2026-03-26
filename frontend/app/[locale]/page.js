'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Star, Zap, Shield, Truck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { productsAPI } from '../../lib/api';
import { getDictionary } from '../../i18n';
import { formatPrice, cn } from '../../lib/utils';
import Navbar from '../../components/Navbar';

export default function HomePage({ params: { locale = 'en' } }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const productsT = dict?.products || {};
  const homeT = dict?.home || {};
  const navT = dict?.nav || {};
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect logged-in users to profile
    if (isAuthenticated) {
      router.replace(`/${locale}/profile`);
      return;
    }
    fetchProducts();
  }, [isAuthenticated, router, locale]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 8 });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} dict={dict} />
      
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">{homeT.heroTitle || 'Smart Technology'}</span>
              <br />
              <span className="text-gray-900 dark:text-white">{homeT.heroSubtitle || 'Premium Shopping Experience'}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover the latest technology products with premium quality, competitive prices, and excellent service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/products`} className="btn-primary inline-flex items-center gap-2">
                {productsT.shop || 'Shop Now'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href={`/${locale}/register`} className="btn-secondary inline-flex items-center gap-2">
                {t.register}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{homeT.fastDelivery || 'Fast Delivery'}</h3>
              <p className="text-gray-600 dark:text-gray-300">{homeT.fastDeliveryDesc || 'Quick and reliable shipping to your doorstep'}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{homeT.securePayment || 'Secure Payment'}</h3>
              <p className="text-gray-600 dark:text-gray-300">{homeT.securePaymentDesc || '100% secure payment methods'}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{homeT.freeReturns || 'Free Returns'}</h3>
              <p className="text-gray-600 dark:text-gray-300">{homeT.freeReturnsDesc || '30-day return policy'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{productsT.featured || 'Featured Products'}</h2>
            <Link 
              href={`/${locale}/products`} 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-48 w-full mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/${locale}/products/${product.id}`}
                  className="card group"
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                    {product.images?.[0] ? (
                      <Image 
                        src={product.images[0]} 
                        alt={locale === 'ar' ? product.name_ar : product.name_en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {locale === 'ar' ? product.name_ar : product.name_en}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-lg font-bold text-primary-600">
                      {formatPrice(product.price, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-700 via-primary-600 to-orange-400 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold">{homeT.brandName || 'Smart Technology'}</span>
              </div>
              <p className="text-gray-400">{homeT.footerDescription || 'Premium e-commerce platform for technology products.'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{homeT.quickLinks || 'Quick Links'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href={`/${locale}/products`} className="hover:text-white">{navT.products}</Link></li>
                <li><Link href={`/${locale}/about`} className="hover:text-white">{homeT.about || 'About'}</Link></li>
                <li><Link href={`/${locale}/contact`} className="hover:text-white">{homeT.contact || 'Contact'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{homeT.account || 'Account'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href={`/${locale}/login`} className="hover:text-white">{t.login}</Link></li>
                <li><Link href={`/${locale}/register`} className="hover:text-white">{t.register}</Link></li>
                <li><Link href={`/${locale}/orders`} className="hover:text-white">{homeT.orders || 'Orders'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{homeT.contact || 'Contact'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{homeT.email || 'Email'}: info@smarttech.com</li>
                <li>{homeT.phone || 'Phone'}: +1 234 567 890</li>
                <li>{homeT.address || 'Address'}: Tech City, TC 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {homeT.brandName || 'Smart Technology'}. {t.allRights || 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}