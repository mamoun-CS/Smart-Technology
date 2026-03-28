'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, Layers, ShoppingCart, Users, Truck, Settings, 
  Search, Bell, User, Menu, X, LogOut, ChevronDown, MapPin, Tag, BarChart
} from '@/components/icons';
import { useAuthStore } from '@/store';
import { getDictionary } from '@/i18n';
import { cn } from '@/lib';
import { toast } from 'sonner';

const sidebarItems = [
  { id: 'profile', label: 'profile', labelAr: ' الواجهة الاساسية', icon: LayoutDashboard, href: '/profile' },
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard, href: '/admin' },
  { id: 'products', label: 'Products', labelAr: 'المنتجات', icon: Package, href: '/admin/products' },
  { id: 'categories', label: 'Categories', labelAr: 'الفئات', icon: Layers, href: '/admin/categories' },
  { id: 'orders', label: 'Orders', labelAr: 'الطلبات', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'users', label: 'Users', labelAr: 'المستخدمين', icon: Users, href: '/admin/users' },
  { id: 'addresses', label: 'Addresses', labelAr: 'العناوين', icon: MapPin, href: '/admin/addresses' },
  { id: 'offers', label: 'Offers', labelAr: 'العروض', icon: Tag, href: '/admin/offers' },
  { id: 'shipping', label: 'Shipping', labelAr: 'الشحن', icon: Truck, href: '/admin/shipping' },
  { id: 'analytics', label: 'Analytics', labelAr: 'التحليلات', icon: BarChart, href: '/admin/analytics' },
  { id: 'settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children, params: { locale = 'en' } }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const dict = getDictionary(locale);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, user, router, locale]);

  const handleLogout = () => {
    logout();
    toast.success(locale === 'ar' ? 'تم تسجيل الخروج' : 'Logged out successfully');
    router.push(`/${locale}/login`);
  };

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === `/${locale}/admin` || pathname === `/${locale}/admin/`;
    }
    return pathname.startsWith(`/${locale}${href}`);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Admin</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={`/${locale}${item.href}`}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-red text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{locale === 'ar' ? item.labelAr : item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-brand-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="h-full flex items-center justify-between px-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="w-8 h-8 bg-brand-red/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-red" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || 'Admin'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href={`/${locale}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <User className="w-4 h-4" />
                          {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <LogOut className="w-4 h-4" />
                          {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
