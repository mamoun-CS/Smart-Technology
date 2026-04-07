/**
 * Validation Tests
 * 
 * Run with: npm test
 * 
 * These tests validate the checkout validation logic and successful order submission flow.
 */

const { 
  isValidPhoneNumber, 
  validateCheckoutForm,
  isAdmin,
  isCustomer,
  canAccessCart,
  canAccessCheckout 
} = require('../lib/utils');

describe('isValidPhoneNumber', () => {
  test('should validate international phone format with +', () => {
    expect(isValidPhoneNumber('+970599123456')).toBe(true);
    expect(isValidPhoneNumber('+972501234567')).toBe(true);
    expect(isValidPhoneNumber('+1-212-555-1234')).toBe(true);
  });

  test('should validate local phone format without +', () => {
    expect(isValidPhoneNumber('0599123456')).toBe(true);
    expect(isValidPhoneNumber('0599123456')).toBe(true);
  });

  test('should reject invalid phone numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('abc')).toBe(false);
    expect(isValidPhoneNumber('123')).toBe(false);
    expect(isValidPhoneNumber(null)).toBe(false);
    expect(isValidPhoneNumber(undefined)).toBe(false);
  });
});

describe('validateCheckoutForm', () => {
  test('should return valid for complete form', () => {
    const formData = {
      full_name: 'Ahmed Mansour',
      phone: '+970599123456',
      shipping_address: '123 Main Street',
      payment_method: 'credit_card'
    };
    const result = validateCheckoutForm(formData, 'en');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('should return errors for missing full_name', () => {
    const formData = {
      full_name: '',
      phone: '+970599123456',
      shipping_address: '123 Main Street',
      payment_method: 'credit_card'
    };
    const result = validateCheckoutForm(formData, 'en');
    expect(result.isValid).toBe(false);
    expect(result.errors.full_name).toBeDefined();
  });

  test('should return errors for invalid phone', () => {
    const formData = {
      full_name: 'Ahmed Mansour',
      phone: 'invalid',
      shipping_address: '123 Main Street',
      payment_method: 'credit_card'
    };
    const result = validateCheckoutForm(formData, 'en');
    expect(result.isValid).toBe(false);
    expect(result.errors.phone).toBeDefined();
  });

  test('should return errors for missing shipping address', () => {
    const formData = {
      full_name: 'Ahmed Mansour',
      phone: '+970599123456',
      shipping_address: '',
      payment_method: 'credit_card'
    };
    const result = validateCheckoutForm(formData, 'en');
    expect(result.isValid).toBe(false);
    expect(result.errors.shipping_address).toBeDefined();
  });

  test('should return errors for missing payment method', () => {
    const formData = {
      full_name: 'Ahmed Mansour',
      phone: '+970599123456',
      shipping_address: '123 Main Street',
      payment_method: ''
    };
    const result = validateCheckoutForm(formData, 'en');
    expect(result.isValid).toBe(false);
    expect(result.errors.payment_method).toBeDefined();
  });
});

describe('Role checks', () => {
  test('isAdmin should return true for admin role', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
  });

  test('isAdmin should return false for non-admin roles', () => {
    expect(isAdmin({ role: 'customer' })).toBe(false);
    expect(isAdmin({ role: 'trader' })).toBe(false);
    expect(isAdmin({})).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  test('isCustomer should return true for customer role', () => {
    expect(isCustomer({ role: 'customer' })).toBe(true);
  });

  test('isCustomer should return true for user without role (default customer)', () => {
    expect(isCustomer({})).toBe(true);
    expect(isCustomer(null)).toBe(true);
  });

  test('isCustomer should return false for admin and trader', () => {
    expect(isCustomer({ role: 'admin' })).toBe(false);
    expect(isCustomer({ role: 'trader' })).toBe(false);
  });

  test('canAccessCart should work correctly', () => {
    expect(canAccessCart({ role: 'customer' })).toBe(true);
    expect(canAccessCart({})).toBe(true);
    expect(canAccessCart({ role: 'admin' })).toBe(false);
  });

  test('canAccessCheckout should work correctly', () => {
    expect(canAccessCheckout({ role: 'customer' })).toBe(true);
    expect(canAccessCheckout({})).toBe(true);
    expect(canAccessCheckout({ role: 'admin' })).toBe(false);
  });
});