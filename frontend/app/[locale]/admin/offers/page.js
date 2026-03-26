'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign, Users, X } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { offersAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatPrice, formatDate, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';

export default function OffersManagement({ params: { locale = 'en' } }) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    usage_limit: '',
    min_order_amount: '',
    starts_at: '',
    expires_at: '',
    description: '',
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
    fetchOffers();
  }, [isAuthenticated, user, router, locale]);

  const fetchOffers = async () => {
    try {
      const res = await offersAPI.getAll();
      setOffers(res.data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
      };
      
      if (editingOffer) {
        await offersAPI.update(editingOffer.id, data);
        toast.success(locale === 'ar' ? 'تم تحديث العرض' : 'Offer updated');
      } else {
        await offersAPI.create(data);
        toast.success(locale === 'ar' ? 'تم إنشاء العرض' : 'Offer created');
      }
      
      setShowModal(false);
      setEditingOffer(null);
      resetForm();
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا العرض؟' : 'Are you sure you want to delete this offer?')) {
      return;
    }
    
    try {
      await offersAPI.delete(id);
      toast.success(locale === 'ar' ? 'تم حذف العرض' : 'Offer deleted');
      fetchOffers();
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      await offersAPI.update(offer.id, { is_active: !offer.is_active });
      toast.success(offer.is_active ? 'تم تعطيل العرض' : 'تم تفعيل العرض');
      fetchOffers();
    } catch (error) {
      toast.error('Failed to update offer');
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      code: offer.code || '',
      discount_type: offer.discount_type || 'percentage',
      discount_value: offer.discount_value || '',
      usage_limit: offer.usage_limit || '',
      min_order_amount: offer.min_order_amount || '',
      starts_at: offer.starts_at ? offer.starts_at.split('T')[0] : '',
      expires_at: offer.expires_at ? offer.expires_at.split('T')[0] : '',
      description: offer.description || '',
      is_active: offer.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      usage_limit: '',
      min_order_amount: '',
      starts_at: '',
      expires_at: '',
      description: '',
      is_active: true
    });
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    resetForm();
    setShowModal(true);
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isValid = (offer) => {
    if (!offer.is_active) return false;
    if (offer.expires_at && isExpired(offer.expires_at)) return false;
    if (offer.usage_limit && offer.used_count >= offer.usage_limit) return false;
    return true;
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
                <div key={i} className="skeleton h-24 w-full" />
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
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة العروض والخصومات' : 'Offers & Discounts Management'}</h1>
            </div>
            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {locale === 'ar' ? 'إضافة عرض' : 'Add Offer'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي العروض' : 'Total Offers'}</p>
                  <p className="text-2xl font-bold">{offers.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Percent className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'العروض النشطة' : 'Active Offers'}</p>
                  <p className="text-2xl font-bold">{offers.filter(o => isValid(o)).length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'العروض المنتهية' : 'Expired Offers'}</p>
                  <p className="text-2xl font-bold">{offers.filter(o => isExpired(o.expires_at)).length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي الاستخدام' : 'Total Uses'}</p>
                  <p className="text-2xl font-bold">{offers.reduce((sum, o) => sum + (o.used_count || 0), 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className={cn("card p-6", !isValid(offer) && "opacity-60")}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      isValid(offer) ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {offer.discount_type === 'percentage' ? (
                        <Percent className="w-6 h-6 text-green-600" />
                      ) : (
                        <DollarSign className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{offer.code}</h3>
                      <p className="text-sm text-gray-500">
                        {offer.discount_type === 'percentage' 
                          ? `${offer.discount_value}% ${locale === 'ar' ? 'خصم' : 'off'}`
                          : `${formatPrice(offer.discount_value, locale)} ${locale === 'ar' ? 'خصم' : 'off'}`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      offer.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {offer.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'ar' ? 'مستخدم' : 'Used'}</span>
                    <span>{offer.used_count || 0}/{offer.usage_limit || '∞'}</span>
                  </div>
                  {offer.min_order_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'ar' ? 'الحد الأدنى' : 'Min Order'}</span>
                      <span>{formatPrice(offer.min_order_amount, locale)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'ar' ? 'ينتهي' : 'Expires'}</span>
                    <span className={cn(isExpired(offer.expires_at) && "text-red-500")}>
                      {offer.expires_at ? formatDate(offer.expires_at, locale) : (locale === 'ar' ? 'غير محدد' : 'No expiry')}
                    </span>
                  </div>
                </div>

                {offer.description && (
                  <p className="text-sm text-gray-500 mt-3 pt-3 border-t">{offer.description}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleEdit(offer)}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    {locale === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    {locale === 'ar' ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
            
            {offers.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد عروض' : 'No offers found'}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingOffer 
                    ? (locale === 'ar' ? 'تعديل العرض' : 'Edit Offer')
                    : (locale === 'ar' ? 'إضافة عرض جديد' : 'Add New Offer')
                  }
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'كود الخصم' : 'Discount Code'}</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="input w-full"
                      placeholder="e.g., SUMMER20"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'نوع الخصم' : 'Discount Type'}</label>
                      <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        className="input w-full"
                      >
                        <option value="percentage">{locale === 'ar' ? 'نسبة مئوية' : 'Percentage (%)'}</option>
                        <option value="fixed">{locale === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount ($)'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'قيمة الخصم' : 'Discount Value'}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        className="input w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'حد الاستخدام' : 'Usage Limit'}</label>
                      <input
                        type="number"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                        className="input w-full"
                        placeholder={locale === 'ar' ? 'اترك فارغاً لغير محدود' : 'Leave empty for unlimited'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order Amount'}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.min_order_amount}
                        onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}</label>
                      <input
                        type="date"
                        value={formData.starts_at}
                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                      <input
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الوصف' : 'Description'}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full h-20"
                      placeholder={locale === 'ar' ? 'وصف اختياري...' : 'Optional description...'}
                    />
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