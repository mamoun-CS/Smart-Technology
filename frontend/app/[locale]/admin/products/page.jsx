'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Trash2, Package, Image as ImageIcon, AlertCircle, Upload, X, 
  Search, Filter, MoreVertical, Eye, ChevronDown
} from '@/components/icons';
import { useAuthStore } from '@/store';
import { productsAPI, uploadAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, formatDate, cn, getProductImage } from '@/lib';
import { toast } from 'sonner';

export default function ProductsManagement({ params: { locale = 'en' } }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
      toast.error(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Create preview URLs for immediate display
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);

      // Upload images to server using uploadAPI (includes auth token)
      const formDataUpload = new FormData();
      files.forEach(file => {
        formDataUpload.append('images', file);
      });

      const response = await uploadAPI.uploadMultiple(formDataUpload);
      const data = response.data;

      if (data.success) {
        // Replace blob URLs with server URLs
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...data.imageUrls]
        }));
        
        // Update previews: replace blob URLs with server URLs
        setImagePreviews(prev => {
          // Find blob URLs (they start with 'blob:')
          const blobUrls = prev.filter(url => url.startsWith('blob:'));
          const serverUrls = prev.filter(url => !url.startsWith('blob:'));
          // Replace blob URLs with server URLs
          return [...serverUrls, ...data.imageUrls];
        });

        toast.success(locale === 'ar' ? 'تم إضافة الصور' : 'Images added');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(locale === 'ar' ? 'فشل رفع الصور' : 'Failed to upload images');
      // Remove previews on error
      setImagePreviews(prev => prev.slice(0, prev.length - files.length));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (index) => {
    const imageUrl = formData.images[index];
    
    // If it's a server URL (not a blob), delete from server
    if (imageUrl && !imageUrl.startsWith('blob:')) {
      try {
        const filename = imageUrl.split('/').pop();
        await uploadAPI.deleteImage(filename);
      } catch (error) {
        console.error('Error deleting image from server:', error);
      }
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const unitPrice = parseFloat(formData.unit_price);
      const wholesalePrice = parseFloat(formData.wholesale_price) || unitPrice;
      const minOrderQuantity = parseInt(formData.min_order_quantity) || 1;
      
      if (wholesalePrice && unitPrice && wholesalePrice >= unitPrice) {
        toast.error(locale === 'ar' 
          ? 'سعر الجملة يجب أن يكون أقل من سعر التجزئة' 
          : 'Wholesale price must be less than retail price'
        );
        return;
      }
      
      if (minOrderQuantity < 1) {
        toast.error(locale === 'ar' 
          ? 'الحد الأدنى للطلب يجب أن يكون على الأقل 1' 
          : 'Minimum order quantity must be at least 1'
        );
        return;
      }
      
      const data = {
        ...formData,
        unit_price: unitPrice,
        wholesale_price: wholesalePrice,
        min_order_quantity: minOrderQuantity,
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
      toast.error(error.response?.data?.message || (locale === 'ar' ? 'فشل حفظ المنتج' : 'Failed to save product'));
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await productsAPI.delete(productToDelete.id);
      toast.success(locale === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      fetchData();
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error(locale === 'ar' 
          ? 'ليس لديك صلاحية لحذف هذا المنتج' 
          : 'You do not have permission to delete this product');
      } else if (error.response?.status === 401) {
        toast.error(locale === 'ar' 
          ? 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى' 
          : 'Session expired, please login again');
      } else {
        toast.error(locale === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product');
      }
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        {locale === 'ar' ? 'نفد' : 'Out of stock'}
      </span>;
    } else if (stock <= 5) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        {stock} {locale === 'ar' ? 'منخفض' : 'Low'}
      </span>;
    } else {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        {stock} {locale === 'ar' ? 'متوفر' : 'In stock'}
      </span>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ar' ? 'إدارة المنتجات' : 'Product Management'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {locale === 'ar' ? 'إدارة منتجاتك والمخزون' : 'Manage your products and inventory'}
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {locale === 'ar' ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث بالاسم أو الباركود...' : 'Search by name or barcode...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="all">{locale === 'ar' ? 'كل الفئات' : 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name_en}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'المنتج' : 'Product'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'سعر الجملة' : 'Wholesale'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'المخزون' : 'Stock'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'الفئة' : 'Category'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={getProductImage(product.images, 0)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{product.name_en}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.name_ar}</p>
                          {product.barcode && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">#{product.barcode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(product.unit_price, locale)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.wholesale_price ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatPrice(product.wholesale_price, locale)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStockBadge(product.stock)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {product.category_name_en || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingProduct 
                    ? (locale === 'ar' ? 'تعديل المنتج' : 'Edit Product')
                    : (locale === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')
                  }
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {locale === 'ar' ? 'صور المنتج' : 'Product Images'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <img src={preview.startsWith('blob:') ? preview : getProductImage([preview])} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-brand-red hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2"
                    >
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {locale === 'ar' ? 'انقر لإضافة صور' : 'Click to add images'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} *
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} *
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                {/* Price Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'سعر التجزئة' : 'Retail Price'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.wholesale_price}
                      onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Stock and Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order Qty'}
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_quantity}
                      onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'المخزون' : 'Stock'}
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    >
                      <option value="">{locale === 'ar' ? 'اختر الفئة' : 'Select category'}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Description Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent h-24 resize-none"
                    />
                  </div>
                </div>
                
                {/* Barcode and Warehouse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الباركود' : 'Barcode'}
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'موقع المستودع' : 'Warehouse Location'}
                    </label>
                    <input
                      type="text"
                      value={formData.warehouse_location}
                      onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors font-medium"
                >
                  {editingProduct 
                    ? (locale === 'ar' ? 'تحديث' : 'Update')
                    : (locale === 'ar' ? 'إنشاء' : 'Create')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'ar' ? 'حذف المنتج' : 'Delete Product'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {locale === 'ar' 
                  ? `هل أنت متأكد من حذف "${productToDelete?.name_en}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${productToDelete?.name_en}"? This action cannot be undone.`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {locale === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
