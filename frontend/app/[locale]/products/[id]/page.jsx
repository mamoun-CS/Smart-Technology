'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { productsAPI, cartAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, cn, getProductImage } from '@/lib';
import { toast } from 'sonner';
import { Navbar } from '@/components';
import { Footer } from '@/components';
import { Button } from '@/components';
import { Loading } from '@/components';
import { Tooltip } from '@/components';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Info, Edit, X, Upload, Package } from '@/components/icons';

export default function ProductDetailPage({ params: { locale = 'en' } }) {
  const { id } = useParams();
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const productT = dict?.products || {};
  
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Handle image load errors
  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    fetchProduct();
    if (user?.role === 'admin') {
      fetchCategories();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getOne(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(locale === 'ar' ? 'فشل تحميل المنتج' : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsAddingToCart(true);
      await cartAPI.addItem({
        product_id: product.id,
        quantity: quantity
      });
      toast.success(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(locale === 'ar' ? 'فشل الإضافة إلى السلة' : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  // Check if user can see wholesale price
  const canSeeWholesalePrice = user?.role === 'admin' || user?.role === 'merchant';
  const isCustomer = user?.role === 'customer' || !user?.role;
  const isAdmin = user?.role === 'admin';

  // Calculate if wholesale price should be applied
  const shouldApplyWholesale = canSeeWholesalePrice && 
    product?.wholesale_price && 
    quantity >= (product?.min_order_quantity || 1);

  // Get the effective price
  const getEffectivePrice = () => {
    if (shouldApplyWholesale) {
      return product.wholesale_price;
    }
    return product?.unit_price || product?.price || 0;
  };

  // Calculate savings
  const getSavings = () => {
    if (shouldApplyWholesale && product?.unit_price && product?.wholesale_price) {
      return product.unit_price - product.wholesale_price;
    }
    return 0;
  };

  // Edit modal functions
  const handleEditClick = () => {
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
    setImagePreviews(product.images || []);
    setShowEditModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Create preview URLs for immediate display
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);

      // Upload images to server using native fetch
      const formDataUpload = new FormData();
      files.forEach(file => {
        formDataUpload.append('images', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/multiple`, {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload
      });

      const data = await response.json();

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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/${filename}`, {
          method: 'DELETE',
          credentials: 'include'
        });
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
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
      
      await productsAPI.update(product.id, data);
      toast.success(locale === 'ar' ? 'تم تحديث المنتج' : 'Product updated');
      
      setShowEditModal(false);
      fetchProduct(); // Refresh product data
    } catch (error) {
      toast.error(error.response?.data?.message || (locale === 'ar' ? 'فشل تحديث المنتج' : 'Failed to update product'));
    } finally {
      setIsUpdating(false);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
            </h1>
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
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <a href={`/${locale}`} className="hover:text-brand-red">
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </a>
            <span>/</span>
            <a href={`/${locale}/products`} className="hover:text-brand-red">
              {locale === 'ar' ? 'المنتجات' : 'Products'}
            </a>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">
              {locale === 'ar' ? product.name_ar : product.name_en}
            </span>
          </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                {product.images && product.images.length > 0 && !imageErrors[selectedImage] ? (
                  <img
                    src={getProductImage(product.images, selectedImage)}
                    alt={locale === 'ar' ? product.name_ar : product.name_en}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(selectedImage)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-24 h-24" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        selectedImage === index
                          ? "border-brand-red"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      {!imageErrors[index] ? (
                        <img
                          src={getProductImage(product.images, index)}
                          alt={`${locale === 'ar' ? product.name_ar : product.name_en} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {locale === 'ar' ? product.name_ar : product.name_en}
                  </h1>
                  {product.category_name_en && (
                    <p className="text-brand-red font-medium">
                      {locale === 'ar' ? product.category_name_ar : product.category_name_en}
                    </p>
                  )}
                </div>
                
                {/* Admin Edit Button */}
                {isAdmin && (
                  <Button
                    onClick={handleEditClick}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {locale === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                {/* Retail Price - Always visible */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(getEffectivePrice(), locale)}
                  </span>
                  {shouldApplyWholesale && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.unit_price, locale)}
                    </span>
                  )}
                </div>

                {/* Wholesale Price - Only for merchants and admins */}
                {canSeeWholesalePrice && product.wholesale_price && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          {locale === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPrice(product.wholesale_price, locale)}
                        </p>
                      </div>
                      {product.min_order_quantity && (
                        <div className="text-right">
                          <p className="text-xs text-green-700 dark:text-green-400">
                            {locale === 'ar' ? 'الحد الأدنى' : 'Min. Qty'}
                          </p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {product.min_order_quantity}
                          </p>
                        </div>
                      )}
                    </div>
                    {shouldApplyWholesale && (
                      <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {locale === 'ar' ? 'أنت توفر' : 'You save'}: {formatPrice(getSavings(), locale)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Info for customers about wholesale */}
                {isCustomer && product.wholesale_price && (
                  <Tooltip
                    content={locale === 'ar' 
                      ? 'أسعار الجملة متاحة فقط للتجار. يرجى تسجيل الدخول بحساب تاجر لعرض أسعار الجملة.'
                      : 'Wholesale prices are only available for merchants. Please sign in with a merchant account to view wholesale prices.'
                    }
                    position="top"
                  >
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 cursor-help">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            {locale === 'ar' ? 'أسعار الجملة متاحة' : 'Wholesale pricing available'}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {locale === 'ar' 
                              ? 'تسجيل الدخول كتاجر للحصول على أسعار الجملة'
                              : 'Sign in as a merchant to access wholesale prices'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  product.stock > 0 ? "bg-green-500" : "bg-red-500"
                )} />
                <span className={cn(
                  "font-medium",
                  product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {product.stock > 0 
                    ? (locale === 'ar' ? 'متوفر' : 'In Stock')
                    : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock')
                  }
                </span>
                {product.stock > 0 && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({product.stock} {locale === 'ar' ? 'قطعة' : 'units'})
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {locale === 'ar' ? 'الكمية' : 'Quantity'}:
                </span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Wholesale Quantity Warning */}
              {canSeeWholesalePrice && product.wholesale_price && product.min_order_quantity && quantity < product.min_order_quantity && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {locale === 'ar' 
                      ? `أضف ${product.min_order_quantity - quantity} قطع إضافية للحصول على سعر الجملة`
                      : `Add ${product.min_order_quantity - quantity} more units to get wholesale price`
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart 
                    ? (locale === 'ar' ? 'جاري الإضافة...' : 'Adding...')
                    : (locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart')
                  }
                </Button>
                <Button variant="outline" className="px-4">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="px-4">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Product Description */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {locale === 'ar' ? product.description_ar : product.description_en}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Edit Modal */}
      {showEditModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {locale === 'ar' ? 'تعديل المنتج' : 'Edit Product'}
                </h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateProduct} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
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

                {/* Description Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Price Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'الحد الأدنى للطلب' : 'Min. Order Qty'}
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_quantity}
                      onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Stock and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'المخزون' : 'Stock'} *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      required
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
                        <option key={cat.id} value={cat.id}>
                          {locale === 'ar' ? cat.name_ar : cat.name_en}
                        </option>
                      ))}
                    </select>
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
              
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors font-medium disabled:opacity-50"
                >
                  {isUpdating 
                    ? (locale === 'ar' ? 'جاري التحديث...' : 'Updating...')
                    : (locale === 'ar' ? 'تحديث المنتج' : 'Update Product')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer locale={locale} dict={dict} />
    </div>
  );
}
