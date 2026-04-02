'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Globe, LogOut, LayoutDashboard, Package, Bell, MessageSquare, Tag, Settings, Heart } from '@/components/icons';
import { useAuthStore } from '@/store';
import { useCartStore } from '@/store';
import { useNotificationStore } from '@/store';
import { cn, getDirection, formatDate } from '@/lib';

export default function Navbar({ locale = 'en', dict = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Use local mounted state to prevent hydration mismatch for auth UI
  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const direction = getDirection(locale);
  const t = dict?.common || {};
  const navT = dict?.nav || {};

  // Initialize auth state on mount
  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchNotifications();
    }
  }, [isAuthenticated, fetchCart, fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Navigate based on notification type
    if (notification.type === 'order') {
      router.push(`/${locale}/orders`);
    } else if (notification.type === 'offer') {
      router.push(`/${locale}/products`);
    }
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
     mounted && isScrolled
  ? 'bg-white shadow-md'
  : 'bg-white'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
  src="/images/logo.png"
  alt="Smart Technology Logo"
  className="h-14 sm:h-16 md:h-20 w-auto object-contain"
  loading="eager"
/>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {/* Show login/register buttons only after hydration to prevent hydration mismatch */}
            {!mounted || !isAuthenticated ? (
              <>
                <Link
                  href={`/${locale}`}
                  className={cn(
                    'font-medium transition-colors',
                    pathname === `/${locale}`
                      ? 'text-gray-800'
                      : 'text-gray-800/90 hover:text-gray-800'
                  )}
                >
                  {navT.home || t.home}
                </Link>
                <Link
                  href={`/${locale}/products`}
                  className={cn(
                    'font-medium transition-colors',
                    pathname.includes('/products')
                      ? 'text-gray-800'
                      : 'text-gray-800/90 hover:text-gray-800'
                  )}
                >
                  {navT.products || 'Products'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/profile`}
                  className={cn(
                    'font-medium transition-colors',
                    pathname.includes('/profile')
                      ? 'text-gray-800'
                      : 'text-gray-800/90 hover:text-gray-800'
                  )}
                >
                  {navT.profile || 'Profile'}
                </Link>
                <Link
                  href={`/${locale}/products`}
                  className={cn(
                    'font-medium transition-colors',
                    pathname.includes('/products')
                      ? 'text-gray-800'
                      : 'text-gray-800/90 hover:text-gray-800'
                  )}
                >
                  {navT.products || 'Products'}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href={`/${locale}/admin`}
                    className={cn(
                      'font-medium transition-colors',
                      pathname.includes('/admin')
                        ? 'text-gray-800'
                        : 'text-gray-800/90 hover:text-gray-800'
                    )}
                  >
                    {navT.admin}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-self-end gap-4">
            {/* Language Switcher */}
            <Link 
              href={pathname.replace(`/${locale}`, locale === 'en' ? '/ar' : '/en')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Globe className="w-5 h-5 text-gray-800" />
            </Link>

            {/* Notifications */}
            {mounted && isAuthenticated && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-800" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-gray-800 text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={cn(
                    "absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
                    direction === 'rtl' && "left-0 right-auto"
                  )}>
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold">{navT.notifications || 'Notifications'}</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          {navT.markAllRead || 'Mark all read'}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">{navT.noNotifications || 'No notifications'}</p>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={cn(
                              "p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                              !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-full",
                                notification.type === 'order' && "bg-blue-100",
                                notification.type === 'offer' && "bg-green-100",
                                notification.type === 'account' && "bg-purple-100"
                              )}>
                                {notification.type === 'order' && <ShoppingCart className="w-4 h-4 text-blue-600" />}
                                {notification.type === 'offer' && <Tag className="w-4 h-4 text-green-600" />}
                                {notification.type === 'account' && <User className="w-4 h-4 text-purple-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(notification.created_at, locale)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link 
                      href={`/${locale}/notifications`}
                      className="block p-3 text-center text-sm text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {navT.viewAllNotifications || 'View All Notifications'}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-gray-800 text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {mounted && isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <User className="w-5 h-5 text-gray-800" />
                </button>
                <div className={cn(
                  "absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
                  direction === 'rtl' ? "left-0 right-auto" : "right-0"
                )}>
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="text-xs text-primary-600 capitalize">{user?.role}</span>
                  </div>
                  <div className="p-2">
                    {user?.role === 'admin' && (
                      <Link 
                        href={`/${locale}/admin`}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {navT.admin}
                      </Link>
                    )}
                    {user?.role === 'trader' && (
                      <Link 
                        href={`/${locale}/trader`}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Package className="w-4 h-4" />
                        {navT.trader}
                      </Link>
                    )}
                    <Link 
                      href={`/${locale}/favorites`}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Heart className="w-4 h-4" />
                      {navT.favorites || 'Favorites'}
                    </Link>
                    <Link 
                      href={`/${locale}/orders`}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {navT.orders}
                    </Link>
                    <Link 
                      href={`/${locale}/support`}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {navT.support || 'Support'}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                href={`/${locale}/login`}
                className="btn-primary text-sm py-2 px-4"
              >
                {t.login}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-gray-800" />
              ) : (
                <Menu className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col gap-4">
              {/* Show login/register buttons only after hydration to prevent hydration mismatch */}
              {!mounted || !isAuthenticated ? (
                <>
                  <Link
                    href={`/${locale}`}
                    className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {navT.home}
                  </Link>
                  <Link
                    href={`/${locale}/products`}
                    className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {navT.products}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/profile`}
                    className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {navT.profile || 'Profile'}
                  </Link>
                  <Link
                    href={`/${locale}/favorites`}
                    className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {navT.favorites || 'Favorites'}
                  </Link>
                  <Link
                    href={`/${locale}/products`}
                    className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {navT.products}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href={`/${locale}/admin`}
                      className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {navT.admin}
                    </Link>
                  )}
                  {user?.role === 'trader' && (
                    <Link
                      href={`/${locale}/trader`}
                      className="px-4 py-2 text-gray-800 hover:bg-white/10 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {navT.trader}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}