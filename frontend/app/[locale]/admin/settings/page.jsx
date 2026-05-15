'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Check,
  AlertCircle
} from '@/components/icons';
import { useAuthStore, useThemeStore } from '@/store';
import { toast } from 'sonner';
import { profileAPI } from '@/lib/api';

export default function AdminSettingsPage({ params: { locale = 'en' } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const language = useThemeStore((state) => state.language);
  const compactMode = useThemeStore((state) => state.compactMode);
  const showImages = useThemeStore((state) => state.showImages);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setLanguage = useThemeStore((state) => state.setLanguage);
  const setCompactMode = useThemeStore((state) => state.setCompactMode);
  const setShowImages = useThemeStore((state) => state.setShowImages);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderAlerts: true,
    stockAlerts: true,
    newUserAlerts: true,
    marketingEmails: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme,
    language: language,
    compactMode: compactMode,
    showImages: showImages
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true
  });

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
      return;
    }
    
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user, router, locale]);

  useEffect(() => {
    setAppearanceSettings({
      theme: theme,
      language: language,
      compactMode: compactMode,
      showImages: showImages
    });
  }, [theme, language, compactMode, showImages]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await profileAPI.updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });

      if (profileData.newPassword && profileData.currentPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
          setIsLoading(false);
          return;
        }
        await profileAPI.updatePassword({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword
        });
      }

      toast.success(locale === 'ar' ? 'تم حفظ الملف الشخصي' : 'Profile saved successfully');
      setSaved(true);
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || (locale === 'ar' ? 'فشل حفظ الملف الشخصي' : 'Failed to save profile'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedNotifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      localStorage.setItem('notificationSettings', JSON.stringify({
        ...savedNotifications,
        ...notificationSettings
      }));
      
      toast.success(locale === 'ar' ? 'تم حفظ إعدادات الإشعارات' : 'Notification settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    try {
      setTheme(appearanceSettings.theme);
      setLanguage(appearanceSettings.language);
      setCompactMode(appearanceSettings.compactMode);
      setShowImages(appearanceSettings.showImages);
      
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      
      toast.success(locale === 'ar' ? 'تم حفظ إعدادات المظهر' : 'Appearance settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedSecurity = JSON.parse(localStorage.getItem('securitySettings') || '{}');
      localStorage.setItem('securitySettings', JSON.stringify({
        ...savedSecurity,
        ...securitySettings
      }));
      
      toast.success(locale === 'ar' ? 'تم حفظ إعدادات الأمان' : 'Security settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: locale === 'ar' ? 'الملف الشخصي' : 'Profile', icon: User },
    { id: 'notifications', label: locale === 'ar' ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'appearance', label: locale === 'ar' ? 'المظهر' : 'Appearance', icon: Palette },
    { id: 'security', label: locale === 'ar' ? 'الأمان' : 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {locale === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-gray-400 mt-1">
            {locale === 'ar' ? 'إدارة إعدادات لوحة التحكم' : 'Manage your dashboard settings'}
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm">{locale === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-red text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {locale === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {locale === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {locale === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex items-center gap-2 bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading 
                  ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                }
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {locale === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: locale === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', desc: locale === 'ar' ? 'تلقي الإشعارات عبر البريد الإلكتروني' : 'Receive notifications via email' },
                { key: 'orderAlerts', label: locale === 'ar' ? 'تنبيهات الطلبات' : 'Order Alerts', desc: locale === 'ar' ? 'تلقي تنبيهات للطلبات الجديدة' : 'Get alerts for new orders' },
                { key: 'stockAlerts', label: locale === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts', desc: locale === 'ar' ? 'تلقي تنبيهات عندما ينخفض المخزون' : 'Get alerts when stock is low' },
                { key: 'newUserAlerts', label: locale === 'ar' ? 'تنبيهات المستخدمين الجدد' : 'New User Alerts', desc: locale === 'ar' ? 'تلقي تنبيهات للمستخدمين الجدد' : 'Get alerts for new users' },
                { key: 'marketingEmails', label: locale === 'ar' ? 'رسائل تسويقية' : 'Marketing Emails', desc: locale === 'ar' ? 'تلقي رسائل تسويقية وعروض' : 'Receive marketing emails and offers' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, [item.key]: !notificationSettings[item.key] })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings[item.key] ? 'bg-brand-red' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotifications}
                disabled={isLoading}
                className="flex items-center gap-2 bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading 
                  ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (locale === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')
                }
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {locale === 'ar' ? 'إعدادات المظهر' : 'Appearance Settings'}
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-white font-medium mb-3">{locale === 'ar' ? 'السمة' : 'Theme'}</p>
                <div className="flex gap-3">
                  {['light', 'dark', 'system'].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: themeOption })}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        appearanceSettings.theme === themeOption
                          ? 'bg-brand-red text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {themeOption === 'light' ? (locale === 'ar' ? 'فاتح' : 'Light') :
                       themeOption === 'dark' ? (locale === 'ar' ? 'داكن' : 'Dark') :
                       (locale === 'ar' ? 'النظام' : 'System')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-white font-medium mb-3">{locale === 'ar' ? 'اللغة' : 'Language'}</p>
                <div className="flex gap-3">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'ar', label: 'العربية' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, language: lang.code })}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        appearanceSettings.language === lang.code
                          ? 'bg-brand-red text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{locale === 'ar' ? 'الوضع المدمج' : 'Compact Mode'}</p>
                  <p className="text-sm text-gray-400">{locale === 'ar' ? 'عرض أكثر كثافة للمحتوى' : 'Denser content display'}</p>
                </div>
                <button
                  onClick={() => setAppearanceSettings({ ...appearanceSettings, compactMode: !appearanceSettings.compactMode })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    appearanceSettings.compactMode ? 'bg-brand-red' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    appearanceSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{locale === 'ar' ? 'عرض الصور' : 'Show Images'}</p>
                  <p className="text-sm text-gray-400">{locale === 'ar' ? 'عرض صور المنتجات في الجداول' : 'Show product images in tables'}</p>
                </div>
                <button
                  onClick={() => setAppearanceSettings({ ...appearanceSettings, showImages: !appearanceSettings.showImages })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    appearanceSettings.showImages ? 'bg-brand-red' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    appearanceSettings.showImages ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveAppearance}
                disabled={isLoading}
                className="flex items-center gap-2 bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading 
                  ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (locale === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')
                }
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {locale === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{locale === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
                  <p className="text-sm text-gray-400">{locale === 'ar' ? 'إضافة طبقة حماية إضافية لحسابك' : 'Add an extra layer of security to your account'}</p>
                </div>
                <button
                  onClick={() => setSecuritySettings({ ...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    securitySettings.twoFactorAuth ? 'bg-brand-red' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-white font-medium mb-3">{locale === 'ar' ? 'مهلة الجلسة' : 'Session Timeout'}</p>
                <p className="text-sm text-gray-400 mb-3">{locale === 'ar' ? 'تسجيل الخروج تلقائياً بعد فترة عدم نشاط' : 'Automatically log out after inactivity period'}</p>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                >
                  <option value="15">{locale === 'ar' ? '15 دقيقة' : '15 minutes'}</option>
                  <option value="30">{locale === 'ar' ? '30 دقيقة' : '30 minutes'}</option>
                  <option value="60">{locale === 'ar' ? 'ساعة واحدة' : '1 hour'}</option>
                  <option value="120">{locale === 'ar' ? 'ساعتين' : '2 hours'}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{locale === 'ar' ? 'تنبيهات تسجيل الدخول' : 'Login Alerts'}</p>
                  <p className="text-sm text-gray-400">{locale === 'ar' ? 'تلقي تنبيهات عند تسجيل الدخول من جهاز جديد' : 'Get alerts when logging in from a new device'}</p>
                </div>
                <button
                  onClick={() => setSecuritySettings({ ...securitySettings, loginAlerts: !securitySettings.loginAlerts })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    securitySettings.loginAlerts ? 'bg-brand-red' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-yellow-500 font-medium">{locale === 'ar' ? 'نصيحة أمنية' : 'Security Tip'}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {locale === 'ar' 
                        ? 'يُنصح بتفعيل المصادقة الثنائية وتغيير كلمة المرور بانتظام لحماية حسابك.'
                        : 'We recommend enabling two-factor authentication and changing your password regularly to protect your account.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSecurity}
                disabled={isLoading}
                className="flex items-center gap-2 bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading 
                  ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (locale === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
