'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Layers, Package } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { productsAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatPrice, formatDate, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';

export default function CategoriesManagement({ params: { locale = 'en' } }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    parent_id: '',
    image_url: ''
  });
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchCategories();
  }, [isAuthenticated, user, router, locale]);

  const fetchCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        parent_id: formData.parent_id || null
      };
      
      if (editingCategory) {
        await productsAPI.updateCategory(editingCategory.id, data);
        toast.success(locale === 'ar' ? 'تم تحديث الفئة' : 'Category updated');
      } else {
        await productsAPI.createCategory(data);
        toast.success(locale === 'ar' ? 'تم إنشاء الفئة' : 'Category created');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      await productsAPI.deleteCategory(id);
      toast.success(locale === 'ar' ? 'تم حذف الفئة' : 'Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en || '',
      name_ar: category.name_ar || '',
      description_en: category.description_en || '',
      description_ar: category.description_ar || '',
      parent_id: category.parent_id || '',
      image_url: category.image_url || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      parent_id: '',
      image_url: ''
    });
  };

  const openCreateModal = () => {
    setEditingCategory(null);
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
                <div key={i} className="skeleton h-16 w-full" />
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
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة الفئات' : 'Category Management'}</h1>
            </div>
            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {locale === 'ar' ? 'إضافة فئة' : 'Add Category'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name_en}</h3>
                      <p className="text-sm text-gray-500">{category.name_ar}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {category.description_en && (
                  <p className="text-sm text-gray-500 mt-3">{category.description_en}</p>
                )}
                <div className="mt-3 text-xs text-gray-400">
                  {category.product_count || 0} {locale === 'ar' ? 'منتج' : 'products'}
                </div>
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد فئات' : 'No categories found'}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingCategory 
                    ? (locale === 'ar' ? 'تعديل الفئة' : 'Edit Category')
                    : (locale === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category')
                  }
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (English)</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      className="input w-full h-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">الوصف (العربية)</label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      className="input w-full h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="input w-full"
                      placeholder="https://example.com/image.jpg"
                    />
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