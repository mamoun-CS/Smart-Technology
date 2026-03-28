'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Trash2, Truck, MapPin, X, Search, ChevronDown, 
  DollarSign, Clock, ToggleLeft, ToggleRight
} from '@/components/icons';
import { useAuthStore } from '@/store';
import { shippingAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatPrice, formatDate, cn } from '@/lib';
import { toast } from 'sonner';

export default function ShippingManagement({ params: { locale = 'en' } }) {
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    price: '',
    estimated_days: '',
    active: true
  });
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchAreas();
  }, [isAuthenticated, user, router, locale]);

  const fetchAreas = async () => {
    try {
      const res = await shippingAPI.getAreas();
      setAreas(res.data.areas || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error(locale === 'ar' ? 'فشل تحميل مناطق الشحن' : 'Failed to load shipping areas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        estimated_days: parseInt(formData.estimated_days) || null
      };
      
      if (editingArea) {
        await shippingAPI.updateArea(editingArea.id, data);
        toast.success(locale === 'ar' ? 'تم تحديث المنطقة' : 'Area updated');
      } else {
        await shippingAPI.createArea(data);
        toast.success(locale === 'ar' ? 'تم إنشاء المنطقة' : 'Area created');
      }
      
      setShowModal(false);
      setEditingArea(null);
      resetForm();
      fetchAreas();
    } catch (error) {
      toast.error(error.response?.data?.message || (locale === 'ar' ? 'فشل حفظ المنطقة' : 'Failed to save area'));
    }
  };

  const handleDeleteClick = (area) => {
    setAreaToDelete(area);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!areaToDelete) return;
    
    try {
      await shippingAPI.deleteArea(areaToDelete.id);
      toast.success(locale === 'ar' ? 'تم حذف المنطقة' : 'Area deleted');
      fetchAreas();
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل حذف المنطقة' : 'Failed to delete area');
    } finally {
      setShowDeleteModal(false);
      setAreaToDelete(null);
    }
  };

  const handleToggleActive = async (area) => {
    try {
      await shippingAPI.updateArea(area.id, { active: !area.active });
      toast.success(area.active 
        ? (locale === 'ar' ? 'تم تعطيل المنطقة' : 'Area deactivated')
        : (locale === 'ar' ? 'تم تفعيل المنطقة' : 'Area activated')
      );
      fetchAreas();
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل تحديث المنطقة' : 'Failed to update area');
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      name_en: area.name_en || '',
      name_ar: area.name_ar || '',
      price: area.price || '',
      estimated_days: area.estimated_days || '',
      active: area.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      price: '',
      estimated_days: '',
      active: true
    });
  };

  const openCreateModal = () => {
    setEditingArea(null);
    resetForm();
    setShowModal(true);
  };

  const filteredAreas = areas.filter(area => {
    return searchTerm === '' || 
      area.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            {locale === 'ar' ? 'إدارة الشحن' : 'Shipping Management'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {locale === 'ar' ? 'إدارة مناطق وتكاليف الشحن' : 'Manage shipping zones and costs'}
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {locale === 'ar' ? 'إضافة منطقة' : 'Add Zone'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{areas.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'إجمالي المناطق' : 'Total Zones'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {areas.filter(a => a.active).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'المناطق النشطة' : 'Active Zones'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(areas.reduce((sum, a) => sum + (a.price || 0), 0) / (areas.length || 1), locale)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'متوسط التكلفة' : 'Avg. Cost'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === 'ar' ? 'بحث بالاسم...' : 'Search by name...'}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      {/* Areas Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'المنطقة' : 'Zone'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'تكلفة التوصيل' : 'Delivery Cost'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'أيام التوصيل' : 'Estimated Days'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{area.name_en}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{area.name_ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(area.price, locale)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {area.estimated_days ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {area.estimated_days} {locale === 'ar' ? 'يوم' : 'days'}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(area)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                          area.active 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50" 
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        {area.active ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            {locale === 'ar' ? 'نشط' : 'Active'}
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            {locale === 'ar' ? 'غير نشط' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(area)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(area)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'لا توجد مناطق شحن' : 'No shipping zones found'}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingArea 
                    ? (locale === 'ar' ? 'تعديل المنطقة' : 'Edit Zone')
                    : (locale === 'ar' ? 'إضافة منطقة جديدة' : 'Add New Zone')
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
              <div className="space-y-5">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'تكلفة التوصيل' : 'Delivery Cost'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'ar' ? 'أيام التوصيل' : 'Estimated Days'}
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_days}
                      onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder={locale === 'ar' ? 'مثال: 3' : 'e.g., 3'}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      formData.active ? "bg-brand-red" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        formData.active ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {locale === 'ar' ? 'نشط' : 'Active'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'تفعيل أو تعطيل منطقة الشحن' : 'Enable or disable this shipping zone'}
                    </p>
                  </div>
                </div>
              </div>
              
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
                  {editingArea 
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
      {showDeleteModal && areaToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'ar' ? 'حذف المنطقة' : 'Delete Zone'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {locale === 'ar' 
                  ? `هل أنت متأكد من حذف "${areaToDelete.name_en}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${areaToDelete.name_en}"? This action cannot be undone.`
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
