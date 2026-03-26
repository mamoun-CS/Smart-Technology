'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Truck, MapPin } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { shippingAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatPrice, formatDate, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';

export default function ShippingManagement({ params: { locale = 'en' } }) {
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    delivery_cost: '',
    estimated_days: '',
    is_active: true
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        delivery_cost: parseFloat(formData.delivery_cost),
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
      toast.error(error.response?.data?.message || 'Failed to save area');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه المنطقة؟' : 'Are you sure you want to delete this area?')) {
      return;
    }
    
    try {
      await shippingAPI.deleteArea(id);
      toast.success(locale === 'ar' ? 'تم حذف المنطقة' : 'Area deleted');
      fetchAreas();
    } catch (error) {
      toast.error('Failed to delete area');
    }
  };

  const handleToggleActive = async (area) => {
    try {
      await shippingAPI.updateArea(area.id, { is_active: !area.is_active });
      toast.success(area.is_active ? 'تم تعطيل المنطقة' : 'تم تفعيل المنطقة');
      fetchAreas();
    } catch (error) {
      toast.error('Failed to update area');
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      name_en: area.name_en || '',
      name_ar: area.name_ar || '',
      delivery_cost: area.delivery_cost || '',
      estimated_days: area.estimated_days || '',
      is_active: area.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      delivery_cost: '',
      estimated_days: '',
      is_active: true
    });
  };

  const openCreateModal = () => {
    setEditingArea(null);
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
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة الشحن والتوصيل' : 'Shipping & Delivery Management'}</h1>
            </div>
            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {locale === 'ar' ? 'إضافة منطقة' : 'Add Area'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي المناطق' : 'Total Areas'}</p>
                  <p className="text-2xl font-bold">{areas.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'المناطق النشطة' : 'Active Areas'}</p>
                  <p className="text-2xl font-bold">{areas.filter(a => a.is_active).length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <span className="text-purple-600 font-bold">$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'متوسط تكلفة الشحن' : 'Avg. Shipping Cost'}</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(areas.reduce((sum, a) => sum + (a.delivery_cost || 0), 0) / (areas.length || 1), locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Areas Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'المنطقة' : 'Area'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'تكلفة التوصيل' : 'Delivery Cost'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'أيام التوصيل' : 'Estimated Days'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{area.name_en}</p>
                        <p className="text-sm text-gray-500">{area.name_ar}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(area.delivery_cost, locale)}</td>
                    <td className="px-4 py-3">
                      {area.estimated_days ? `${area.estimated_days} ${locale === 'ar' ? 'يوم' : 'days'}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(area)}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          area.is_active 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {area.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(area)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(area.id)}
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
            {areas.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد مناطق شحن' : 'No shipping areas found'}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">
                  {editingArea 
                    ? (locale === 'ar' ? 'تعديل المنطقة' : 'Edit Area')
                    : (locale === 'ar' ? 'إضافة منطقة جديدة' : 'Add New Area')
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.delivery_cost}
                        onChange={(e) => setFormData({ ...formData, delivery_cost: e.target.value })}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estimated Days</label>
                      <input
                        type="number"
                        value={formData.estimated_days}
                        onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                        className="input w-full"
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">
                      {locale === 'ar' ? 'نشط' : 'Active'}
                    </label>
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