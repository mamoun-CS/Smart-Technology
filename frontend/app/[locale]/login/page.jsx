'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Phone } from '@/components/icons';
import { useAuthStore } from '@/store';
import { getDictionary } from '@/i18n';
import { cn } from '@/lib';
import { Navbar } from '@/components';
import { Button } from '@/components';
import { Input } from '@/components';

const loginSchema = z.object({
  login: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage({ params: { locale = 'en' } }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('email');
  const [countryCode, setCountryCode] = useState('+970');
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.auth || {};
  const commonT = dict?.common || {};
  const errorsT = dict?.errors || {};
  
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const loginValue = watch('login');

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${locale}/profile`);
    }
    return () => clearError();
  }, [isAuthenticated, router, locale, clearError]);

  useEffect(() => {
    if (loginValue.length >= 9 && /^\d+$/.test(loginValue)) {
      setLoginType('phone');
    } else if (loginValue.includes('@')) {
      setLoginType('email');
    }
  }, [loginValue]);

  const onSubmit = async (data) => {
    const loginData = loginType === 'phone' 
      ? { phone: data.login, countryCode, password: data.password }
      : { email: data.login, password: data.password };
    
    try {
      await login(loginData);
      router.push(`/${locale}/profile`);
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <img
              src="/images/logo.png"
              alt="Smart Technology Logo"
              className="h-14 w-auto mx-auto mb-4 object-contain"
              loading="eager"
            />
            <h1 className="text-3xl font-bold text-white">{t.loginTitle}</h1>
            <p className="text-gray-400 mt-2">{t.loginSubtitle}</p>
          </div>

          <div className="card p-8 bg-dark-800 border-dark-600">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label text-gray-300">{t.emailOrPhone || 'Email or Phone'}</label>
                {loginType === 'phone' ? (
                  <div className="flex gap-2">
                    <div className="relative w-28">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="input pl-3 pr-8 bg-dark-700 border-dark-600 text-white appearance-none cursor-pointer"
                      >
                        <option value="+970">+970</option>
                        <option value="+972">+972</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        {...register('login')}
                        placeholder={t.phonePlaceholder || "59 ********"}
                        className="input pl-10 bg-dark-700 border-dark-600 text-white"
                        maxLength={9}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      {...register('login')}
                      placeholder={t.emailPlaceholder || "you@example.com"}
                      className="input pl-10 bg-dark-700 border-dark-600 text-white"
                    />
                  </div>
                )}
                {errors.login && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.login.message}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {loginType === 'phone' ? 'Enter 9 digits starting with 59' : 'Enter email address'}
                </p>
              </div>

              <div>
                <label className="label text-gray-300">{t.password}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="input pl-10 pr-10 bg-dark-700 border-dark-600 text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-brand-red focus:ring-brand-red accent-brand-red" 
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <Link 
                  href={`/${locale}/forgot-password`}
                  className="text-sm text-brand-red hover:text-brand-red-light"
                >
                  {t.forgotPassword}
                </Link>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                className="mt-2"
              >
                {t.signIn}
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              {t.hasAccount}{' '}
              <Link href={`/${locale}/register`} className="text-brand-red hover:text-brand-red-light font-medium">
                {t.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}