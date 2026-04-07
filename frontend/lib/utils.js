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

export const formatCurrencyLabel = (amount, locale) => {
  const currencyLabel = locale === 'ar' ? 'شيكل' : 'ILS';
  const roundedAmount = typeof amount === 'number' ? Math.round(amount * 100) / 100 : amount;
  return `${roundedAmount} ${currencyLabel}`;
};

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

// Product image handling utilities
export function getProductImage(images, index = 0) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  const imageUrl = images[index] || null;
  
  // If the image URL is a relative path (starts with /), prepend the backend URL
  if (imageUrl && imageUrl.startsWith('/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${imageUrl}`;
  }
  
  return imageUrl;
}

export function hasValidImage(images) {
  if (!images || !Array.isArray(images)) {
    return false;
  }
  return images.length > 0 && !!images[0];
}

// Role checking utilities
export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isCustomer(user) {
  return user?.role === 'customer' || !user?.role;
}

export function isTrader(user) {
  return user?.role === 'trader';
}

export function isMerchant(user) {
  return user?.role === 'merchant';
}

export function canAccessCart(user) {
  return isCustomer(user) || isMerchant(user);
}

export function canAccessCheckout(user) {
  return isCustomer(user) || isMerchant(user);
}

// Phone number validation (supports local and international formats)
export function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.trim());
}

// Validate checkout form
export function validateCheckoutForm(formData, locale = 'en', deliveryMethod = 'shipping') {
  const errors = {};
  
  if (!formData.full_name || formData.full_name.trim().length < 2) {
    errors.full_name = locale === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required';
  }
  
  if (!formData.phone || formData.phone.trim().length === 0) {
    errors.phone = locale === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
  } else if (!isValidPhoneNumber(formData.phone)) {
    errors.phone = locale === 'ar' 
      ? 'رقم هاتف غير صالح (مثال: +970599123456 أو 0599123456)' 
      : 'Invalid phone number (e.g., +970599123456 or 0599123456)';
  }
  
  if (deliveryMethod !== 'pickup' && (!formData.shipping_address || formData.shipping_address.trim().length === 0)) {
    errors.shipping_address = locale === 'ar' ? 'عنوان الشحن مطلوب' : 'Shipping address is required';
  }
  
  if (!formData.payment_method) {
    errors.payment_method = locale === 'ar' ? 'طريقة الدفع مطلوبة' : 'Payment method is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}