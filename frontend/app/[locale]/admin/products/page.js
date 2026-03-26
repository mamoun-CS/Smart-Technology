'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Package, Image as ImageIcon, AlertCircle, Upload, X } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { productsAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatPrice, formatDate, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';

export default function ProductsManagement({ params: { locale = 'en' } }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    unit_price: '',
    wholesale_price: '',
    min_order_quantity: 1,
    stock: 0,
    category_id: '',
    images: [],
    barcode: '',
    warehouse_location: ''
  });
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router, locale]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 100 }),
        productsAPI.getCategories()
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);

      // In a real app, you would upload to a server/cloud storage
      // For now, we'll use local URLs
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }));

      toast.success(locale === 'ar' ? 'تم إضافة الصور' : 'Images added');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        wholesale_price: parseFloat(formData.wholesale_price) || parseFloat(formData.unit_price),
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        stock: parseInt(formData.stock) || 0
      };
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
        toast.success(locale === 'ar' ? 'تم تحديث المنتج' : 'Product updated');
      } else {
        await productsAPI.create({ ...data, created_by: user.id });
        toast.success(locale === 'ar' ? 'تم إنشاء المنتج' : 'Product created');
      }
      
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await productsAPI.delete(id);
      toast.success(locale === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setImagePreviews(product.images || []);
    setFormData({
      name_en: product.name_en || '',
      name_ar: product.name_ar || '',
      description_en: product.description_en || '',
      description_ar: product.description_ar || '',
      unit_price: product.unit_price || '',
      wholesale_price: product.wholesale_price || '',
      min_order_quantity: product.min_order_quantity || 1,
      stock: product.stock || 0,
      category_id: product.category_id || '',
      images: product.images || [],
      barcode: product.barcode || '',
      warehouse_location: product.warehouse_location || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      unit_price: '',
      wholesale_price: '',
      min_order_quantity: 1,
      stock: 0,
      category_id: '',
      images: [],
      barcode: '',
      warehouse_location: ''
    });
    setImagePreviews([]);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-20 w-full" />
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
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/admin`} className="text-primary-600 hover:underline">
                ← {locale === 'ar' ? 'العودة' : 'Back'}
              </Link>
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة المنتجات' : 'Product Management'}</h1>
            </div>
            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {locale === 'ar' ? 'إضافة منتج' : 'Add Product'}
            </button>
          </div>

          {/* Products Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'سعر الجملة' : 'Wholesale'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'المخزون' : 'Stock'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'الفئة' : 'Category'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name_en}</p>
                          <p className="text-sm text-gray-500">{product.name_ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.unit_price, locale)}</td>
                    <td className="px-4 py-3">
                      {product.wholesale_price ? formatPrice(product.wholesale_price, locale) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs",
                        product.stock === 0 ? "bg-red-100 text-red-600" :
                        product.stock <= 5 ? "bg-orange-100 text-orange-600" :
                        "bg-green-100 text-green-600"
                      )}>
                        {product.stock} {locale === 'ar' ? 'قطعة' : 'units'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{product.category_name_en || '-'}</td>
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
            {products.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد منتجات' : 'No products found'}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProduct 
                    ? (locale === 'ar' ? 'تعديل المنتج' : 'Edit Product')
                    : (locale === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')
                  }
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {locale === 'ar' ? 'صور المنتج' : 'Product Images'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition-colors flex flex-col items-center gap-2"
                      >
                        {isUploading ? (
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {locale === 'ar' ? 'انقر لإضافة صور' : 'Click to add images'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name (English)</label>
                      <input
                        type="text"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم (العربية)</label>
                      <input
                        type="text"
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        className="input w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Wholesale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Order Qty</label>
                      <input
                        type="number"
                        value={formData.min_order_quantity}
                        onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="input w-full"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (English)</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      className="input w-full h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">الوصف (العربية)</label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      className="input w-full h-24"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Barcode</label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Warehouse Location</label>
                      <input
                        type="text"
                        value={formData.warehouse_location}
                        onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary flex-1"
                    >
                      {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button type="submit" className="btn-primary flex-1">
                      {locale === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}