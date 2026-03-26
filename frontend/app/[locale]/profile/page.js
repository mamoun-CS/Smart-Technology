'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit2, 
  LogOut, 
  Key, 
  Save, 
  X, 
  Loader2,
  Settings,
  Package,
  ShoppingBag,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { profileAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatDate, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ProfilePage({ params: { locale = 'en' } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const profileT = dict?.profile || {};
  const navT = dict?.nav || {};
  const authT = dict?.auth || {};
  
  const { user, isAuthenticated, logout, initialize } = useAuthStore();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Initialize auth and fetch profile
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router, locale]);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      setUserData(res.data.user);
      resetProfile({ 
        name: res.data.user.name || '', 
        phone: res.data.user.phone || '' 
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(profileT.failedToLoad || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    setIsSaving(true);
    try {
      const res = await profileAPI.updateProfile(data);
      setUserData(res.data.user);
      toast.success(profileT.profileUpdated || 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || (profileT.failedToUpdate || 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    try {
      await profileAPI.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(profileT.passwordChanged || 'Password changed successfully');
      resetPassword();
      setActiveTab('profile');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || (profileT.failedToChangePassword || 'Failed to change password'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: profileT.admin || 'Admin',
      trader: profileT.trader || 'Trader',
      customer: profileT.customer || 'Customer',
    };
    return roles[role] || role;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar locale={locale} dict={dict} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-500 dark:text-gray-400">
              {profileT.loading || t.loading || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: profileT.profileTab || 'Profile', icon: User },
    { id: 'password', label: profileT.securityTab || 'Security', icon: Key },
    { id: 'orders', label: profileT.ordersTab || 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar locale={locale} dict={dict} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profileT.title || 'My Profile'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {profileT.subtitle || 'Manage your account settings and preferences'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                {/* User Avatar */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {userData?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userData?.email}
                  </p>
                  <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleLabel(userData?.role)}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {profileT.memberSince || 'Member since'}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userData?.created_at ? formatDate(userData.created_at, locale) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {profileT.status || 'Status'}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        userData?.is_verified 
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                      )}>
                        {userData?.is_verified 
                          ? (profileT.active || 'Active')
                          : (profileT.inactive || 'Inactive')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {profileT.logout || 'Logout'}
                </button>
              </div>

              {/* Admin Panel Button */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => router.push(`/${locale}/admin`)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {navT.admin || 'Admin Panel'}
                </button>
              )}

              {/* Trader Panel Button */}
              {user?.role === 'trader' && (
                <button
                  onClick={() => router.push(`/${locale}/trader`)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg transition-colors"
                >
                  <Package className="w-4 h-4" />
                  {navT.trader || 'Trader Panel'}
                </button>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                          activeTab === tab.id
                            ? "border-primary-600 text-primary-600 dark:text-primary-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {profileT.fullName || 'Full Name'}
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerProfile('name')}
                              type="text"
                              className="input w-full pl-10"
                              placeholder={profileT.enterYourName || 'Enter your name'}
                            />
                          </div>
                          {profileErrors.name && (
                            <p className="mt-1 text-sm text-red-500">{profileErrors.name.message}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {profileT.phone || 'Phone Number'}
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerProfile('phone')}
                              type="tel"
                              className="input w-full pl-10"
                              placeholder={profileT.enterPhoneNumber || 'Enter phone number'}
                            />
                          </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {profileT.email || 'Email Address'}
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={userData?.email || ''}
                              disabled
                              className="input w-full pl-10 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {profileT.emailCannotChange || 'Email cannot be changed'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {profileT.saveChanges || 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Password Tab */}
                  {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {profileT.currentPassword || 'Current Password'}
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...registerPassword('currentPassword')}
                            type="password"
                            className="input w-full pl-10"
                            placeholder={profileT.enterCurrentPassword || 'Enter current password'}
                          />
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {profileT.newPassword || 'New Password'}
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...registerPassword('newPassword')}
                            type="password"
                            className="input w-full pl-10"
                            placeholder={profileT.enterNewPassword || 'Enter new password'}
                          />
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {profileT.confirmPassword || 'Confirm Password'}
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...registerPassword('confirmPassword')}
                            type="password"
                            className="input w-full pl-10"
                            placeholder={profileT.confirmNewPassword || 'Confirm new password'}
                          />
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isChangingPassword ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {profileT.updatePassword || 'Update Password'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {profileT.noOrders || 'No Orders Yet'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {profileT.ordersDescription || 'Start shopping to see your orders here'}
                      </p>
                      <button
                        onClick={() => router.push(`/${locale}/products`)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        {profileT.browseProducts || 'Browse Products'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}