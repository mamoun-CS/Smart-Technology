'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { favoritesAPI, productsAPI, adminAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, cn } from '@/lib';
import { toast } from 'sonner';
import { 
  Heart, Package, TrendingUp, Users, ShoppingCart, 
  BarChart3, PieChart, Activity, Star, Eye
} from '@/components/icons';

export default function AdminAnalyticsPage({ params: { locale = 'en' } }) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const analyticsT = dict?.analytics || {};
  
  const { user, isAuthenticated } = useAuthStore();
  const [mostFavorited, setMostFavorited] = useState([]);
  const [bestBuyProducts, setBestBuyProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFavorites: 0,
    totalProducts: 0,
    avgFavoritesPerProduct: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, user, router, locale]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch most favorited products
      const favoritesRes = await favoritesAPI.getMostFavorited(20);
      const products = favoritesRes.data.products || [];
      setMostFavorited(products);
      
      // Fetch best buy (top selling) products
      const bestBuyRes = await adminAPI.getTopProducts({ limit: 10 });
      setBestBuyProducts(bestBuyRes.data.products || []);
      
      // Calculate stats
      const totalFavorites = products.reduce((sum, p) => sum + parseInt(p.favorite_count || 0), 0);
      const totalProducts = products.length;
      const avgFavoritesPerProduct = totalProducts > 0 ? (totalFavorites / totalProducts).toFixed(1) : 0;
      
      setStats({
        totalFavorites,
        totalProducts,
        avgFavoritesPerProduct
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(locale === 'ar' ? 'فشل تحميل التحليلات' : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ar' ? 'تحليلات المفضلة' : 'Favorites Analytics'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {locale === 'ar' 
              ? 'تحليل المنتجات الأكثر إضافة إلى المفضلة'
              : 'Analyze most favorited products'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalFavorites}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'إجمالي المفضلة' : 'Total Favorites'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalProducts}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'المنتجات المفضلة' : 'Favorited Products'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.avgFavoritesPerProduct}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'متوسط المفضلة/منتج' : 'Avg. Favorites/Product'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Most Favorited Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'المنتجات الأكثر إضافة إلى المفضلة' : 'Most Favorited Products'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' 
                  ? 'أعلى 20 منتج تم إضافتها إلى المفضلة من قبل المستخدمين'
                  : 'Top 20 products added to favorites by users'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'الترتيب' : 'Rank'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'المنتج' : 'Product'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'الفئة' : 'Category'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'المخزون' : 'Stock'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'مرات الإضافة' : 'Favorites'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mostFavorited.length > 0 ? (
                mostFavorited.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                          index === 1 && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                          index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                          index > 2 && "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {locale === 'ar' ? product.name_ar : product.name_en}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {product.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {locale === 'ar' ? product.category_name_ar : product.category_name_en || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(product.unit_price, locale)}
                        </span>
                        {product.wholesale_price && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {locale === 'ar' ? 'جملة: ' : 'Wholesale: '}
                            {formatPrice(product.wholesale_price, locale)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          product.stock > 0 ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "text-sm",
                          product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {product.stock} {locale === 'ar' ? 'قطعة' : 'units'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {product.favorite_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/${locale}/products/${product.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'عرض' : 'View'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'لا توجد بيانات مفضلة بعد' : 'No favorites data yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Products Chart */}
      {mostFavorited.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'أفضل 5 منتجات' : 'Top 5 Products'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'حسب عدد مرات الإضافة إلى المفضلة' : 'By number of favorites'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {mostFavorited.slice(0, 5).map((product, index) => {
              const maxFavorites = parseInt(mostFavorited[0]?.favorite_count || 1);
              const percentage = (parseInt(product.favorite_count) / maxFavorites) * 100;
              
              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                        index === 1 && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                        index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                        index > 2 && "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {locale === 'ar' ? product.name_ar : product.name_en}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.favorite_count} {locale === 'ar' ? 'مفضلة' : 'favorites'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={cn(
                        "h-3 rounded-full transition-all duration-500",
                        index === 0 && "bg-yellow-500",
                        index === 1 && "bg-gray-500",
                        index === 2 && "bg-orange-500",
                        index === 3 && "bg-blue-500",
                        index === 4 && "bg-green-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best Buy Products Chart */}
      {bestBuyProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Best Buy Products'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'حسب عدد الطلبات' : 'By number of orders'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {bestBuyProducts.slice(0, 5).map((product, index) => {
              const maxOrders = parseInt(bestBuyProducts[0]?.order_count || 1);
              const percentage = (parseInt(product.order_count) / maxOrders) * 100;
              
              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                        index === 1 && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                        index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                        index > 2 && "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {locale === 'ar' ? product.name_ar : product.name_en}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.order_count} {locale === 'ar' ? 'طلب' : 'orders'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={cn(
                        "h-3 rounded-full transition-all duration-500",
                        index === 0 && "bg-yellow-500",
                        index === 1 && "bg-gray-500",
                        index === 2 && "bg-orange-500",
                        index === 3 && "bg-blue-500",
                        index === 4 && "bg-green-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
