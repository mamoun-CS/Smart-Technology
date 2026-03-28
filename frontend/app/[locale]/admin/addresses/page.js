'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Eye, Trash2, Phone, User, Mail, Pencil } from '@/components/icons';
import { useAuthStore } from '@/store';
import { adminAPI } from '@/lib';
import { getDictionary } from '@/i18n';
import { formatDate, cn } from '@/lib';
import { toast } from 'sonner';



export default function AddressesManagement({ params: { locale = 'en' } }) {
  const [addresses, setAddresses] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  
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
      const [addressesRes, usersRes] = await Promise.all([
        adminAPI.getAllAddresses(),
        adminAPI.getAllUsers()
      ]);
      setAddresses(addressesRes.data.addresses || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  const handleEditClick = (address) => {
    setEditForm({
      id: address.id,
      address: address.address,
      city: address.city || '',
      phone: address.phone || '',
      is_default: address.is_default
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await shippingAPI.updateAddress(editForm.id, {
        address: editForm.address,
        city: editForm.city,
        phone: editForm.phone,
        is_default: editForm.is_default
      });
      toast.success(locale === 'ar' ? 'تم تحديث العنوان' : 'Address updated');
      setIsEditing(false);
      setEditForm(null);
      fetchData();
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل تحديث العنوان' : 'Failed to update address');
    }
  };

  const filteredAddresses = addresses.filter(addr => {
    if (!searchTerm) return true;
    const user = getUserById(addr.user_id);
    const searchLower = searchTerm.toLowerCase();
    return (
      (user && user.name && user.name.toLowerCase().includes(searchLower)) ||
      (addr.address && addr.address.toLowerCase().includes(searchLower)) ||
      (addr.city && addr.city.toLowerCase().includes(searchLower)) ||
      (addr.phone && addr.phone.includes(searchTerm))
    );
  });

  const groupedByUser = filteredAddresses.reduce((acc, addr) => {
    const userId = addr.user_id;
    if (!acc[userId]) {
      const user = getUserById(userId);
      acc[userId] = {
        user,
        addresses: []
      };
    }
    acc[userId].addresses.push(addr);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
       

      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/admin`} className="text-primary-600 hover:underline">
                ← {locale === 'ar' ? 'العودة' : 'Back'}
              </Link>
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'عناوين العملاء' : 'Customer Addresses'}</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي العناوين' : 'Total Addresses'}</p>
                  <p className="text-2xl font-bold">{addresses.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'عملاء لهم عناوين' : 'Customers with Addresses'}</p>
                  <p className="text-2xl font-bold">{Object.keys(groupedByUser).length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <span className="text-purple-600 font-bold">🏙️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'أجمالي المدن' : 'Total Cities'}</p>
                  <p className="text-2xl font-bold">
                    {new Set(addresses.map(a => a.city).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث بالاسم أو العنوان أو الهاتف...' : 'Search by name, address or phone...'}
              className="input w-full pl-10"
            />
          </div>

          {/* Addresses by User */}
          <div className="space-y-6">
            {Object.entries(groupedByUser).map(([userId, data]) => (
              <div key={userId} className="card p-6">
                <div className="flex items-start gap-4 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{data.user?.name || 'Unknown User'}</h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      {data.user?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {data.user.email}
                        </span>
                      )}
                      {data.user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" /> {data.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {data.addresses.length} {locale === 'ar' ? 'عنوان' : 'address(es)'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setSelectedAddress(addr)}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="font-medium">{addr.label || (locale === 'ar' ? 'عنوان' : 'Address')}</p>
                          <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
                          {addr.city && <p className="text-sm text-gray-500">{addr.city}</p>}
                          {addr.postal_code && <p className="text-sm text-gray-500">{addr.postal_code}</p>}
                          {addr.phone && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {addr.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(addr); }}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                          title={locale === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          addr.is_default ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                        )}>
                          {addr.is_default ? (locale === 'ar' ? 'افتراضي' : 'Default') : (locale === 'ar' ? 'ثانوي' : 'Secondary')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedByUser).length === 0 && (
              <div className="card p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد عناوين' : 'No addresses found'}
              </div>
            )}
          </div>

          {/* Address Detail Modal */}
          {selectedAddress && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {locale === 'ar' ? 'تفاصيل العنوان' : 'Address Details'}
                  </h2>
                  <button 
                    onClick={() => setSelectedAddress(null)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'الاسم' : 'Label'}</p>
                    <p className="font-medium">{selectedAddress.label || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'العنوان' : 'Address'}</p>
                    <p className="font-medium">{selectedAddress.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'المدينة' : 'City'}</p>
                      <p className="font-medium">{selectedAddress.city || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{locale === 'ar' ? 'الرمز البريدي' : 'Postal Code'}</p>
                      <p className="font-medium">{selectedAddress.postal_code || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-medium">{selectedAddress.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? 'النوع' : 'Type'}</p>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      selectedAddress.is_default ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {selectedAddress.is_default ? (locale === 'ar' ? 'افتراضي' : 'Default') : (locale === 'ar' ? 'ثانوي' : 'Secondary')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Address Modal */}
          {isEditing && editForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {locale === 'ar' ? 'تعديل العنوان' : 'Edit Address'}
                  </h2>
                  <button 
                    onClick={() => { setIsEditing(false); setEditForm(null); }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'العنوان' : 'Address'}</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'المدينة' : 'City'}</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={editForm.is_default}
                      onChange={(e) => setEditForm({...editForm, is_default: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_default" className="text-sm font-medium">
                      {locale === 'ar' ? 'عنوان افتراضي' : 'Set as default address'}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => { setIsEditing(false); setEditForm(null); }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {locale === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}