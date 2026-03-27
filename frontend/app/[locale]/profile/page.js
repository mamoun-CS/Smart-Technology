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
  Shield, 
  Edit2, 
  LogOut, 
  Key, 
  Save, 
  Loader2,
  Package,
  ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { profileAPI } from '../../../lib/api';
import { getDictionary } from '../../../i18n';
import { formatDate, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/ui/Footer';
import Button from '../../../components/ui/Button';

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
  
  const { user, isAuthenticated, logout, initialize } = useAuthStore();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar locale={locale} dict={dict} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
            <p className="text-gray-400">
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
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-dark-900">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {profileT.title || 'My Profile'}
          </h1>
          <p className="text-gray-400 mt-2">
            {profileT.subtitle || 'Manage your account settings and preferences'}
          </p>
        </div>
      </div>

      <div className="pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 bg-dark-800 border-dark-600 sticky top-24">
                {/* User Avatar */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto bg-brand-gradient rounded-full flex items-center justify-center shadow-brand-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {userData?.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {userData?.email}
                  </p>
                  <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium bg-brand-red/20 text-brand-red">
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleLabel(userData?.role)}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-dark-600 pt-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {profileT.memberSince || 'Member since'}
                      </span>
                      <span className="font-medium text-white">
                        {userData?.created_at ? formatDate(userData.created_at, locale) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {profileT.status || 'Status'}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        userData?.is_verified 
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {userData?.is_verified 
                          ? (profileT.active || 'Active')
                          : (profileT.inactive || 'Inactive')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin/Trader Panel Buttons */}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => router.push(`/${locale}/admin`)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    {navT.admin || 'Admin Panel'}
                  </button>
                )}
                {user?.role === 'trader' && (
                  <button
                    onClick={() => router.push(`/${locale}/trader`)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    {navT.trader || 'Trader Panel'}
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {profileT.logout || 'Logout'}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="card bg-dark-800 border-dark-600 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-dark-600">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                          activeTab === tab.id
                            ? "border-brand-red text-brand-red"
                            : "border-transparent text-gray-400 hover:text-white"
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
                        <div>
                          <label className="label text-gray-300">
                            {profileT.fullName || 'Full Name'}
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              <User className="w-5 h-5" />
                            </div>
                            <input
                              {...registerProfile('name')}
                              type="text"
                              className="input pl-10 bg-dark-700 border-dark-600 text-white"
                              placeholder={profileT.enterYourName || 'Enter your name'}
                            />
                          </div>
                          {profileErrors.name && (
                            <p className="mt-1.5 text-sm text-red-500">{profileErrors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="label text-gray-300">
                            {profileT.phone || 'Phone Number'}
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              <Phone className="w-5 h-5" />
                            </div>
                            <input
                              {...registerProfile('phone')}
                              type="tel"
                              className="input pl-10 bg-dark-700 border-dark-600 text-white"
                              placeholder={profileT.enterPhoneNumber || 'Enter phone number'}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="label text-gray-300">
                            {profileT.email || 'Email Address'}
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              <Mail className="w-5 h-5" />
                            </div>
                            <input
                              type="email"
                              value={userData?.email || ''}
                              disabled
                              className="input pl-10 bg-dark-700/50 border-dark-600 text-gray-400 cursor-not-allowed"
                            />
                          </div>
                          <p className="mt-1.5 text-sm text-gray-500">
                            {profileT.emailCannotChange || 'Email cannot be changed'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" isLoading={isSaving}>
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {profileT.saveChanges || 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Password Tab */}
                  {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                      <div>
                        <label className="label text-gray-300">
                          {profileT.currentPassword || 'Current Password'}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Key className="w-5 h-5" />
                          </div>
                          <input
                            {...registerPassword('currentPassword')}
                            type="password"
                            className="input pl-10 bg-dark-700 border-dark-600 text-white"
                            placeholder={profileT.enterCurrentPassword || 'Enter current password'}
                          />
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1.5 text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label text-gray-300">
                          {profileT.newPassword || 'New Password'}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Key className="w-5 h-5" />
                          </div>
                          <input
                            {...registerPassword('newPassword')}
                            type="password"
                            className="input pl-10 bg-dark-700 border-dark-600 text-white"
                            placeholder={profileT.enterNewPassword || 'Enter new password'}
                          />
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="mt-1.5 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label text-gray-300">
                          {profileT.confirmPassword || 'Confirm Password'}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Key className="w-5 h-5" />
                          </div>
                          <input
                            {...registerPassword('confirmPassword')}
                            type="password"
                            className="input pl-10 bg-dark-700 border-dark-600 text-white"
                            placeholder={profileT.confirmNewPassword || 'Confirm new password'}
                          />
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1.5 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" isLoading={isChangingPassword}>
                          {isChangingPassword ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {profileT.updatePassword || 'Update Password'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {profileT.noOrders || 'No Orders Yet'}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {profileT.ordersDescription || 'Start shopping to see your orders here'}
                      </p>
                      <Button onClick={() => router.push(`/${locale}/products`)}>
                        {profileT.browseProducts || 'Browse Products'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer locale={locale} dict={dict} />
    </div>
  );
}