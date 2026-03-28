import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, locale = 'en') {
  // Handle null, undefined, or invalid values
  if (price === null || price === undefined || isNaN(Number(price))) {
    return locale === 'ar' ? '0 د.إ' : '$0.00';
  }
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) {
    return locale === 'ar' ? '0 د.إ' : '$0.00';
  }
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
}

export function formatDate(date, locale = 'en') {
  // Handle null, undefined, or invalid values
  if (!date) return '';
  
  // Parse the date string and extract date components to avoid timezone issues
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  // Use UTC methods to ensure consistent formatting across server and client
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth();
  const day = dateObj.getUTCDate();
  
  // Create a new date using UTC components to avoid timezone shifts
  const utcDate = new Date(Date.UTC(year, month, day));
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(utcDate);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function truncate(str, length = 50) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function isArabicLocale(locale) {
  return locale === 'ar';
}

export function getDirection(locale) {
  return isArabicLocale(locale) ? 'rtl' : 'ltr';
}