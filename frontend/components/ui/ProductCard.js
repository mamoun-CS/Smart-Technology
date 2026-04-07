'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Star } from '@/components/icons';
import { formatCurrencyLabel, cn, getProductImage, favoritesAPI } from '@/lib';
import { useAuthStore } from '@/store';
import { useState, useEffect } from 'react';

export default function ProductCard({ 
  product, 
  locale = 'en',
  dict = {},
  onAddToCart 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { isAuthenticated } = useAuthStore();
  
  const productName = locale === 'ar' ? product.name_ar : product.name_en;
  const isInStock = product.stock > 0;
  
  // Check if product is in favorites on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await favoritesAPI.check(product.id);
        setIsFavorite(response.data.is_favorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    checkFavoriteStatus();
  }, [product.id, isAuthenticated]);
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInStock) return;
    
    // Just trigger the callback - parent component handles addItem
    onAddToCart?.(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(dict?.common?.pleaseLogin || 'Please login to add favorites');
      return;
    }
    
    setIsTogglingFavorite(true);
    try {
      const response = await favoritesAPI.toggle(product.id);
      setIsFavorite(response.data.is_favorite);
      toast.success(
        response.data.is_favorite 
          ? (dict?.common?.addedToFavorites || 'Added to favorites')
          : (dict?.common?.removedFromFavorites || 'Removed from favorites')
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(dict?.errors?.networkError || 'Failed to update favorites');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Link
      href={`/${locale}/products/${product.id}`}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        'card card-hover h-full flex flex-col',
        isHovered && 'border-brand-red/30 shadow-brand'
      )}>
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 dark:bg-dark-700 overflow-hidden">
          {product.images?.[0] && !imageError && getProductImage(product.images, 0) ? (
            <Image
              src={getProductImage(product.images, 0)}
              alt={productName}
              fill
              className={cn(
                'object-cover transition-transform duration-300',
                isHovered && 'scale-105'
              )}
              onError={handleImageError}
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl">📦</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="badge-primary text-xs">
                {dict?.products?.featured || 'Featured'}
              </span>
            )}
            {!isInStock && (
              <span className="badge-error">
                {dict?.products?.outOfStock || 'Out of Stock'}
              </span>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className={cn(
            'absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300',
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          )}>
            <button 
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={cn(
                'p-2 bg-white dark:bg-dark-800 rounded-full shadow-md transition-colors',
                isFavorite 
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-dark-700',
                isTogglingFavorite && 'opacity-50 cursor-not-allowed'
              )}
              title={isFavorite 
                ? (dict?.common?.removeFromFavorites || 'Remove from favorites')
                : (dict?.common?.addToFavorites || 'Add to favorites')
              }
            >
              <Heart 
                className={cn(
                  'w-4 h-4 transition-colors',
                  isFavorite 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-600 dark:text-gray-300'
                )} 
              />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick view
              }}
              className="p-2 bg-white dark:bg-dark-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              title={dict?.common?.view || 'Quick view'}
            >
              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Add to Cart Button */}
          <div className={cn(
            'absolute bottom-3 left-3 right-3 transition-all duration-300',
            isHovered && isInStock ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={cn(
                'w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all',
                isInStock 
                  ? 'bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg' 
                  : 'bg-gray-200 dark:bg-dark-600 text-gray-500 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">
                {dict?.products?.addToCart || 'Add to Cart'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          {product.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {locale === 'ar' ? product.category.name_ar : product.category.name_en}
            </span>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-red transition-colors">
            {productName}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'w-3.5 h-3.5',
                    i < Math.round(product.rating || 0) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({product.reviews_count || 0})
            </span>
          </div>
          
          {/* Price */}
          <div className="mt-auto flex items-center gap-2">
            <span className="text-lg font-bold text-brand-red">
              {formatCurrencyLabel(product.price, locale)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrencyLabel(product.original_price, locale)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
