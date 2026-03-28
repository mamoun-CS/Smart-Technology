'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, DollarSign, ShoppingCart, Plus, Edit, Trash2 } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store';
import { productsAPI, ordersAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, cn } from '@/lib';
import { toast } from 'sonner';
import { Navbar } from '@/components';

export default function TraderDashboard({ params: { locale = 'en' } }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const traderT = dict?.trader || {};
  
  const { user, isAuthenticated } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'trader') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router, locale]);

  const fetchData = async () => {
    try {
      const [statsRes, productsRes, categoriesRes] = await Promise.all([
        ordersAPI.getTraderStats(),
        productsAPI.getAll({ created_by: user.id }),
        productsAPI.getCategories(),
      ]);
      setStats(statsRes.data.stats);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category_id: data.category_id || null,
        images: data.images ? [data.images] : [],
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    reset({
      name_en: product.name_en,
      name_ar: product.name_ar,
      description_en: product.description_en,
      description_ar: product.description_ar,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error('You can only delete your own products');
      } else if (error.response?.status === 401) {
        toast.error('Session expired, please login again');
      } else {
        toast.error('Failed to delete product');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="skeleton h-4 w-24 mb-2" />
                  <div className="skeleton h-8 w-16" />
                </div>
              ))}
            </div>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{traderT.dashboard || 'Trader Dashboard'}</h1>
            <button
              onClick={() => {
                setEditingProduct(null);
                reset();
                setShowModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {traderT.addProduct || 'Add Product'}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary-100">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{traderT.myProducts || 'My Products'}</p>
                  <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{traderT.myOrders || 'Orders'}</p>
                  <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{traderT.sales || 'Total Sales'}</p>
                  <p className="text-2xl font-bold">{formatPrice(stats?.totalSales || 0, locale)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{traderT.myProducts || 'My Products'}</h2>
            </div>
            {products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No products yet. Add your first product!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t.price}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{traderT.stock}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                              {product.images?.[0] ? (
                                <Image 
                                  src={product.images[0]} 
                                  alt={product.name_en}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">📦</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name_en}</p>
                              <p className="text-sm text-gray-500">{product.name_ar}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-primary-600">
                          {formatPrice(product.price, locale)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs',
                            product.stock > 10 ? 'bg-green-100 text-green-800' : 
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          )}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? traderT.editProduct : traderT.addProduct}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{traderT.nameEn}</label>
                    <input {...register('name_en', { required: true })} className="input" />
                    {errors.name_en && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{traderT.nameAr}</label>
                    <input {...register('name_ar', { required: true })} className="input" />
                    {errors.name_ar && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.price}</label>
                    <input type="number" step="0.01" {...register('price', { required: true })} className="input" />
                    {errors.price && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{traderT.stock}</label>
                    <input type="number" {...register('stock', { required: true })} className="input" />
                    {errors.stock && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{traderT.category}</label>
                  <select {...register('category_id')} className="input">
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {locale === 'ar' ? cat.name_ar : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{traderT.descEn}</label>
                  <textarea {...register('description_en')} className="input" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{traderT.descAr}</label>
                  <textarea {...register('description_ar')} className="input" rows={3} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {t.save}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}