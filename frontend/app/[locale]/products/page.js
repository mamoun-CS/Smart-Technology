'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, X, ShoppingCart, Star, Grid, List, SlidersHorizontal } from 'lucide-react';
import { productsAPI, reviewsAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatPrice, debounce, cn } from '../../../lib/utils';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/ui/Footer';
import ProductCard from '../../../components/ui/ProductCard';
import Button from '../../../components/ui/Button';

export default function ProductsPage({ params: { locale = 'en' } }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  
  // Filters
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-dark-900">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {productsT.title || 'Products'}
          </h1>
          <p className="text-gray-400 mt-2">
            {productsT.subtitle || 'Browse our collection of premium technology products'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="pb-12">
        <div className="container-custom">
          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 -mt-4">
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
                  "p-2.5 rounded-lg border border-dark-600 transition-colors",
                  viewMode === 'grid' 
                    ? "bg-brand-red text-white border-brand-red" 
                    : "bg-dark-800 text-gray-400 hover:text-white"
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 rounded-lg border border-dark-600 transition-colors",
                  viewMode === 'list' 
                    ? "bg-brand-red text-white border-brand-red" 
                    : "bg-dark-800 text-gray-400 hover:text-white"
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2 md:hidden"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {productsT.filterBy || 'Filters'}
            </button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={cn(
              "w-64 flex-shrink-0",
              showFilters ? "block" : "hidden md:block"
            )}>
              <div className="card p-5 sticky top-24 bg-dark-800 border-dark-600">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white">{productsT.filterBy || 'Filter by'}</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-red hover:text-brand-red-light"
                  >
                    {productsT.clearAll || 'Clear All'}
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">{productsT.category || 'Category'}</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => {
                          setSelectedCategory('');
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="text-brand-red accent-brand-red"
                      />
                      <span className="text-sm text-gray-400">{productsT.allCategories || 'All Categories'}</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => {
                            setSelectedCategory(cat.id);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="text-brand-red accent-brand-red"
                        />
                        <span className="text-sm text-gray-400">{locale === 'ar' ? cat.name_ar : cat.name_en}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">{productsT.priceRange || 'Price Range'}</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={productsT.minPrice || 'Min'}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="input text-sm bg-dark-700 border-dark-600"
                    />
                    <input
                      type="number"
                      placeholder={productsT.maxPrice || 'Max'}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="input text-sm bg-dark-700 border-dark-600"
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
                      className="text-brand-red accent-brand-red rounded"
                    />
                    <span className="text-sm text-gray-400">{productsT.inStockOnly || 'In Stock Only'}</span>
                  </label>
                </div>

                {/* Minimum Rating */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">{productsT.minimumRating || 'Minimum Rating'}</h4>
                  <select
                    value={minRating}
                    onChange={(e) => {
                      setMinRating(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="input text-sm bg-dark-700 border-dark-600"
                  >
                    <option value="">{productsT.anyRating || 'Any Rating'}</option>
                    <option value="4">4+ {productsT.stars || 'Stars'}</option>
                    <option value="3">3+ {productsT.stars || 'Stars'}</option>
                    <option value="2">2+ {productsT.stars || 'Stars'}</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">{productsT.sortBy || 'Sort By'}</h4>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by);
                      setSortOrder(order);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="input text-sm bg-dark-700 border-dark-600"
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
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                  <p className="text-gray-400 text-lg">{productsT.noProductsFound || 'No products found'}</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    {productsT.clearAll || 'Clear Filters'}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-400">
                    {pagination.total} {productsT.found || 'products found'}
                  </div>
                  <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                  )}>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        locale={locale}
                        dict={dict}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary px-4 disabled:opacity-50"
                  >
                    {t.previous || 'Previous'}
                  </button>
                  <div className="flex items-center px-4 text-gray-400">
                    {t.page || 'Page'} {pagination.page} {t.of || 'of'} {pagination.totalPages}
                  </div>
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

      {/* Footer */}
      <Footer locale={locale} dict={dict} />
    </div>
  );
}