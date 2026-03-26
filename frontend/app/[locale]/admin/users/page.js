'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Mail, Phone, Shield, Trash2, Edit, X, Check, Filter } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { adminAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatDate, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';

const ROLES = {
  customer: { en: 'Customer', ar: 'عميل', color: 'bg-blue-100 text-blue-600' },
  trader: { en: 'Trader', ar: 'تاجر', color: 'bg-purple-100 text-purple-600' },
  admin: { en: 'Admin', ar: 'مدير', color: 'bg-red-100 text-red-600' }
};

export default function UsersManagement({ params: { locale = 'en' } }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', role: '' });
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const { user: currentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    fetchUsers();
  }, [isAuthenticated, currentUser, router, locale]);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error(locale === 'ar' ? 'لا يمكنك حذف حسابك الخاص' : 'You cannot delete your own account');
      return;
    }
    
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await adminAPI.deleteUser(userId);
      toast.success(locale === 'ar' ? 'تم حذف المستخدم' : 'User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(selectedUser.id, editData);
      toast.success(locale === 'ar' ? 'تم تحديث المستخدم' : 'User updated');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = !searchTerm || 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role) => {
    const roleInfo = ROLES[role] || ROLES.customer;
    return (
      <span className={cn("px-2 py-1 rounded text-xs font-medium", roleInfo.color)}>
        {locale === 'ar' ? roleInfo.ar : roleInfo.en}
      </span>
    );
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
              <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة الحسابات' : 'Manage Accounts'}</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
            {Object.entries(ROLES).map(([role, info]) => (
              <div key={role} className="card p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-lg", info.color.replace('text-', 'bg-').replace('600', '100'))}>
                    <Shield className={cn("w-6 h-6", info.color.replace('100', '600'))} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{locale === 'ar' ? info.ar : info.en}</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === role).length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={locale === 'ar' ? 'بحث بالاسم أو البريد أو الهاتف...' : 'Search by name, email or phone...'}
                className="input w-full pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input w-full md:w-48"
            >
              <option value="all">{locale === 'ar' ? 'كل الأدوار' : 'All Roles'}</option>
              {Object.entries(ROLES).map(([role, info]) => (
                <option key={role} value={role}>{locale === 'ar' ? info.ar : info.en}</option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'الهاتف' : 'Phone'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'الدور' : 'Role'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'التسجيل' : 'Joined'}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name || '-'}</p>
                          {user.is_verified && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Check className="w-3 h-3" /> {locale === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{user.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{user.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.created_at ? formatDate(user.created_at, locale) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={locale === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title={locale === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد مستخدمين' : 'No users found'}
              </div>
            )}
          </div>

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {locale === 'ar' ? 'تعديل المستخدم' : 'Edit User'}
                  </h2>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الاسم' : 'Name'}</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الدور' : 'Role'}</label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="input w-full"
                    >
                      {Object.entries(ROLES).map(([role, info]) => (
                        <option key={role} value={role}>
                          {locale === 'ar' ? info.ar : info.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
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