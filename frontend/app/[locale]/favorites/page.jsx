'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { favoritesAPI, cartAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, cn, getProductImage } from '@/lib';
import { toast } from 'sonner';
import { Navbar } from '@/components';
import { Footer } from '@/components';
import { Button } from '@/components';
import { Loading } from '@/components';
import { ProductCard } from '@/components';
import { Heart, ShoppingCart, Trash2, Package } from '@/components/icons';

export default function FavoritesPage({ params: { locale = 'en' } }) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const favoritesT = dict?.favorites || {};
  
  const { user, isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchFavorites();
  }, [isAuthenticated, router, locale]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await favoritesAPI.getAll();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error(locale === 'ar' ? 'فشل تحميل المفضلة' : 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleRemoveFavorite = async (productId) => {
    setRemovingId(productId);
    try {
      await favoritesAPI.remove(productId);
      setFavorites(prev => prev.filter(fav => fav.id !== productId));
      toast.success(locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error(locale === 'ar' ? 'فشل الإزالة من المفضلة' : 'Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      await cartAPI.addItem({
        product_id: product.id,
        quantity: 1
      });
      toast.success(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(locale === 'ar' ? 'فشل الإضافة إلى السلة' : 'Failed to add to cart');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {locale === 'ar' ? 'مفضلتي' : 'My Favorites'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {locale === 'ar' 
                ? 'المنتجات التي أضفتها إلى قائمة المفضلة'
                : 'Products you have added to your favorites list'
              }
            </p>
          </div>

          {/* Favorites Count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favorites.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {locale === 'ar' ? 'منتج في المفضلة' : 'Products in favorites'}
                </p>
              </div>
            </div>
          </div>

          {/* Favorites Grid */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                    {product.images && product.images.length > 0 && !imageErrors[product.id] ? (
                      <img
                        src={getProductImage(product.images, 0)}
                        alt={locale === 'ar' ? product.name_ar : product.name_en}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(product.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Remove from Favorites Button */}
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      disabled={removingId === product.id}
                      className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title={locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites'}
                    >
                      {removingId === product.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {locale === 'ar' ? product.name_ar : product.name_en}
                    </h3>
                    
                    {product.category_name_en && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {locale === 'ar' ? product.category_name_ar : product.category_name_en}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.unit_price || product.price, locale)}
                      </span>
                      {product.wholesale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.wholesale_price, locale)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock > 0 ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className={cn(
                        "text-sm",
                        product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {product.stock > 0 
                          ? (locale === 'ar' ? 'متوفر' : 'In Stock')
                          : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock')
                        }
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                      </Button>
                      <Button
                        onClick={() => router.push(`/${locale}/products/${product.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        {locale === 'ar' ? 'عرض' : 'View'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'ar' ? 'لا توجد منتجات في المفضلة' : 'No favorites yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {locale === 'ar' 
                  ? 'ابدأ بإضافة المنتجات التي تعجبك إلى قائمة المفضلة لتسهيل العودة إليها لاحقاً'
                  : 'Start adding products you like to your favorites list to easily find them later'
                }
              </p>
              <Button onClick={() => router.push(`/${locale}/products`)}>
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer locale={locale} dict={dict} />
    </div>
  );
}
