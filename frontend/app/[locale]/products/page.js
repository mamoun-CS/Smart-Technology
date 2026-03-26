'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, X, ShoppingCart, Star, Grid, List, SortAsc } from 'lucide-react';
import { productsAPI, reviewsAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatPrice, debounce, cn } from '../../../lib/utils';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';

export default function ProductsPage({ params: { locale = 'en' } }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  
  // New filters
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [viewMode, setViewMode] = useState('grid');

  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const productsT = dict?.products || {};
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category_id: selectedCategory || undefined,
        min_price: priceRange.min || undefined,
        max_price: priceRange.max || undefined,
        in_stock: inStockOnly || undefined,
        rating: minRating || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedCategory, priceRange, inStockOnly, minRating, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setPagination(prev => ({ ...prev, page: 1 }));
      setSearch(value);
    }, 500),
    []
  );

  const handleAddToCart = async (product, quantity = 1) => {
    // Check if trader and meets minimum quantity for wholesale
    if (user?.role === 'trader' && product.min_order_quantity) {
      if (quantity < product.min_order_quantity) {
        toast.warning(`Minimum order for wholesale price: ${product.min_order_quantity} units`);
      }
    }
    
    try {
      await addItem(product.id, quantity);
      toast.success(productsT.addToCart || 'Added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    setMinRating('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Render price based on user role
  const renderPrice = (product) => {
    const isTrader = user?.role === 'trader';
    const meetsMinQty = true; // For now, show both
    
    if (isTrader && product.wholesale_price && product.min_order_quantity) {
      return (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(product.wholesale_price, locale)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            {formatPrice(product.unit_price, locale)}
          </span>
          <span className="text-xs text-green-600">
            Wholesale (min {product.min_order_quantity})
          </span>
        </div>
      );
    }
    
    return (
      <span className="text-lg font-bold text-primary-600">
        {formatPrice(product.unit_price, locale)}
      </span>
    );
  };

  // Render rating stars
  const renderRating = (avgRating, reviewCount) => {
    const rating = parseFloat(avgRating) || 0;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-4 h-4", 
              i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
            )} 
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          ({reviewCount || 0})
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{productsT.title || 'Products'}</h1>
            {user?.role === 'trader' && (
              <p className="text-sm text-green-600 mt-1">
                Showing wholesale prices (minimum {products[0]?.min_order_quantity || 1} units for discount)
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={productsT.searchProducts || 'Search products...'}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg",
                  viewMode === 'grid' ? "bg-primary-100 text-primary-600" : "bg-gray-100"
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg",
                  viewMode === 'list' ? "bg-primary-100 text-primary-600" : "bg-gray-100"
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2 md:hidden"
            >
              <Filter className="w-5 h-5" />
              {productsT.filterByCategory || 'Filters'}
            </button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={cn(
              "w-64 flex-shrink-0",
              showFilters ? "block" : "hidden md:block"
            )}>
              <div className="card p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{productsT.filterBy || 'Filter by'}</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {productsT.clearAll || 'Clear All'}
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">{productsT.category || 'Category'}</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => setSelectedCategory('')}
                        className="text-primary-600"
                      />
                      <span className="text-sm">{productsT.allCategories || 'All Categories'}</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="text-primary-600"
                        />
                        <span className="text-sm">{locale === 'ar' ? cat.name_ar : cat.name_en}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">{productsT.priceRange || 'Price Range'}</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={productsT.minPrice || 'Min'}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="input text-sm"
                    />
                    <input
                      type="number"
                      placeholder={productsT.maxPrice || 'Max'}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="input text-sm"
                    />
                  </div>
                </div>

                {/* In Stock Only */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="text-primary-600 rounded"
                    />
                    <span className="text-sm">{productsT.inStockOnly || 'In Stock Only'}</span>
                  </label>
                </div>

                {/* Minimum Rating */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">{productsT.minimumRating || 'Minimum Rating'}</h4>
                  <select
                    value={minRating}
                    onChange={(e) => {
                      setMinRating(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="input text-sm"
                  >
                    <option value="">{productsT.anyRating || 'Any Rating'}</option>
                    <option value="4">4+ {productsT.stars || 'Stars'}</option>
                    <option value="3">3+ {productsT.stars || 'Stars'}</option>
                    <option value="2">2+ {productsT.stars || 'Stars'}</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="text-sm font-medium mb-2">{productsT.sortBy || 'Sort By'}</h4>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by);
                      setSortOrder(order);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="input text-sm"
                  >
                    <option value="created_at-DESC">{productsT.sortByNewest || 'Newest First'}</option>
                    <option value="created_at-ASC">{productsT.sortByOldest || 'Oldest First'}</option>
                    <option value="unit_price-ASC">{productsT.sortByPriceAsc || 'Price: Low to High'}</option>
                    <option value="unit_price-DESC">{productsT.sortByPriceDesc || 'Price: High to Low'}</option>
                    <option value="avg_rating-DESC">{productsT.sortByTopRated || 'Top Rated'}</option>
                    <option value="stock-DESC">{productsT.sortByMostStock || 'Most Stock'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {isLoading ? (
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="card p-4">
                      <div className="skeleton h-48 w-full mb-4" />
                      <div className="skeleton h-4 w-3/4 mb-2" />
                      <div className="skeleton h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">{productsT.noProductsFound || 'No products found'}</p>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {products.map((product) => (
                    <div key={product.id} className="card group">
                      <Link href={`/${locale}/products/${product.id}`}>
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
                          {product.stock === 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Out of Stock
                            </div>
                          )}
                          {product.stock > 0 && product.stock <= 5 && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              Low Stock
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/${locale}/products/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {locale === 'ar' ? product.name_ar : product.name_en}
                          </h3>
                        </Link>
                        
                        {/* Rating */}
                        {renderRating(product.avg_rating, product.review_count)}
                        
                        <div className="flex items-center justify-between mt-2">
                          {renderPrice(product)}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className="p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Wholesale info for traders */}
                        {user?.role === 'trader' && product.wholesale_price && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">{productsT.wholesale || 'Wholesale'}:</span> {formatPrice(product.wholesale_price, locale)} 
                            <span className="ml-1">({productsT.minOrder || 'min'} {product.min_order_quantity})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary px-4 disabled:opacity-50"
                  >
                    {t.previous || 'Previous'}
                  </button>
                  <span className="flex items-center px-4">
                    {t.page || 'Page'} {pagination.page} {t.of || 'of'} {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary px-4 disabled:opacity-50"
                  >
                    {t.next || 'Next'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}