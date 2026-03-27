'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';
import { useState } from 'react';
import { cn, getDirection } from '../../lib/utils';

export default function Footer({ locale = 'en', dict = {} }) {
  const [email, setEmail] = useState('');
  const direction = getDirection(locale);
  const isRTL = direction === 'rtl';
  
  const commonT = dict?.common || {};
  const homeT = dict?.home || {};
  const navT = dict?.nav || {};
  
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: `/${locale}/products`, label: navT.products },
    { href: `/${locale}/about`, label: homeT.about },
    { href: `/${locale}/contact`, label: homeT.contact },
    { href: `/${locale}/support`, label: navT.support },
  ];

  const accountLinks = [
    { href: `/${locale}/login`, label: commonT.login },
    { href: `/${locale}/register`, label: commonT.register },
    { href: `/${locale}/orders`, label: homeT.orders },
    { href: `/${locale}/cart`, label: commonT.cart },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail('');
  };

  return (
    <footer className="bg-dark-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="logo">
                <span className="logo-text">S</span>
              </div>
              <span className="text-xl font-bold text-white">
                {navT.brandName || 'Smart Technology'}
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              {homeT.footerDescription || 'Premium e-commerce platform for technology products.'}
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">
                {dict?.footer?.subscribe || 'Subscribe to newsletter'}
              </h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict?.footer?.emailPlaceholder || 'Enter your email'}
                  className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-brand-gradient text-white rounded-lg hover:shadow-brand transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2.5 bg-dark-800 rounded-lg hover:bg-brand-red transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {homeT.quickLinks || 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {homeT.account || 'Account'}
            </h4>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {homeT.contact || 'Contact'}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                <span className="text-gray-400">
                  {dict?.footer?.address || '123 Tech Street, Smart City, SC 12345'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-red shrink-0" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-brand-red transition-colors">
                  {dict?.footer?.phone || '+1 234 567 890'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-red shrink-0" />
                <a href="mailto:info@smarttech.com" className="text-gray-400 hover:text-brand-red transition-colors">
                  info@smarttech.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} {navT.brandName || 'Smart Technology'}. {commonT.allRights || 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-6">
              <Link href={`/${locale}/privacy`} className="text-gray-400 text-sm hover:text-brand-red transition-colors">
                {dict?.footer?.privacy || 'Privacy Policy'}
              </Link>
              <Link href={`/${locale}/terms`} className="text-gray-400 text-sm hover:text-brand-red transition-colors">
                {dict?.footer?.terms || 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}