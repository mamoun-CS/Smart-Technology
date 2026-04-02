'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Star, Zap, Shield, Truck, ChevronRight, Sparkles } from '@/components/icons';
import { useAuthStore } from '@/store';
import { productsAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatCurrencyLabel, cn } from '@/lib';
import { Navbar } from '@/components';
import { Footer } from '@/components';
import { ProductCard } from '@/components';
import { Button } from '@/components';

export default function HomePage({ params: { locale = 'en' } }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const productsT = dict?.products || {};
  const homeT = dict?.home || {};
  const navT = dict?.nav || {};
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Don't redirect logged-in users - let them browse
    fetchData();
  }, [locale]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 8, is_featured: 1 }),
        productsAPI.getCategories(),
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: homeT.fastDelivery || 'Fast Delivery',
      description: homeT.fastDeliveryDesc || 'Quick and reliable shipping to your doorstep',
    },
    {
      icon: Shield,
      title: homeT.securePayment || 'Secure Payment',
      description: homeT.securePaymentDesc || '100% secure payment methods',
    },
    {
      icon: Truck,
      title: homeT.freeReturns || 'Free Returns',
      description: homeT.freeReturnsDesc || '30-day return policy',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[100px]" />
        
        <div className="relative container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-brand-red" />
                <span className="text-sm font-medium text-brand-red">
                  {homeT.heroBadge || 'Premium Technology'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-white">
                  {homeT.heroTitle || 'Smart Technology'}
                </span>
                <br />
                <span className="gradient-text">
                  {homeT.heroSubtitle || 'Premium Shopping Experience'}
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                {homeT.heroDesc || 'Discover the latest technology products with premium quality, competitive prices, and excellent service.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={`/${locale}/products`}>
                  <Button as="span" size="lg" className="w-full sm:w-auto">
                    {productsT.shop || 'Shop Now'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button as="span" variant="secondary" size="lg" className="w-full sm:w-auto">
                    {t.register}
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-500">{homeT.products || 'Products'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-sm text-gray-500">{homeT.customers || 'Customers'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">99%</div>
                  <div className="text-sm text-gray-500">{homeT.satisfaction || 'Satisfaction'}</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Logo */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                {/* Animated gradient circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-red via-brand-red-dark to-dark-900 opacity-20 animate-pulse-slow" />
                
                {/* Logo showcase */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand-lg animate-float">
                    <span className="text-white font-bold text-7xl">S</span>
                  </div>
                </div>

                {/* Floating product cards */}
                <div className="absolute top-10 right-0 w-32 h-40 bg-dark-800 rounded-xl border border-dark-600 shadow-dark-lg p-3 animate-fadeIn">
                  <div className="w-full h-20 bg-dark-700 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div className="h-3 w-20 bg-dark-700 rounded mb-1" />
                  <div className="h-3 w-12 bg-brand-red rounded" />
                </div>

                <div className="absolute bottom-10 left-0 w-32 h-40 bg-dark-800 rounded-xl border border-dark-600 shadow-dark-lg p-3 animate-fadeIn">
                  <div className="w-full h-20 bg-dark-700 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl">💻</span>
                  </div>
                  <div className="h-3 w-20 bg-dark-700 rounded mb-1" />
                  <div className="h-3 w-12 bg-brand-red rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-dark-900">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-dark-800 border border-dark-600 hover:border-brand-red/50 transition-all duration-300 hover:shadow-brand"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="heading-2 text-gray-900 dark:text-white">
                {navT.categories || 'Categories'}
              </h2>
              <Link 
                href={`/${locale}/products`}
                className="text-brand-red hover:text-brand-red-light font-medium inline-flex items-center gap-1"
              >
                {t.viewAll}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/${locale}/products?category=${category.id}`}
                  className="group p-6 rounded-xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-600 hover:border-brand-red hover:shadow-brand transition-all text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center group-hover:bg-brand-red/10 transition-colors">
                    <span className="text-3xl">
                      {getCategoryIcon(category.name_en)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {locale === 'ar' ? category.name_ar : category.name_en}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16 bg-dark-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2 text-white">
                {productsT.featured || 'Featured Products'}
              </h2>
              <p className="text-gray-400 mt-1">
                {productsT.featuredDesc || 'Handpicked selection of premium tech products'}
              </p>
            </div>
            <Link 
              href={`/${locale}/products`}
              className="text-brand-red hover:text-brand-red-light font-medium inline-flex items-center gap-1"
            >
              {t.viewAll}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-0">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-gray-400">{productsT.noProductsFound || 'No products found'}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="relative rounded-2xl bg-brand-gradient overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {homeT.ctaTitle || 'Ready to get started?'}
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                {homeT.ctaDesc || 'Join thousands of satisfied customers and discover the best technology products.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${locale}/register`}>
                  <Button as="span" variant="secondary" size="lg" className="!text-dark-900 !bg-white !border-white hover:!bg-gray-100">
                    {t.register}
                  </Button>
                </Link>
                <Link href={`/${locale}/products`}>
                  <Button as="span" variant="outline" size="lg" className="!text-white !border-white hover:!bg-white/10">
                    {productsT.shop || 'Browse Products'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} dict={dict} />
    </div>
  );
}

function getCategoryIcon(name) {
  const icons = {
    'phones': '📱',
    'laptops': '💻',
    'tablets': '📲',
    'accessories': '🎧',
    'wearables': '⌚',
    'cameras': '📷',
    'gaming': '🎮',
    'smart home': '🏠',
  };
  const key = name?.toLowerCase() || '';
  return icons[key] || '📦';
}