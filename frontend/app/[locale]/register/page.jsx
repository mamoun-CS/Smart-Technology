'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Store, ShoppingCart } from '@/components/icons';
import { useAuthStore } from '@/store';
import { getDictionary } from '@/i18n';
import { cn } from '@/lib';
import { Navbar } from '@/components';
import { Button } from '@/components';
import { Input } from '@/components';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'trader']).default('customer'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterPage({ params: { locale = 'en' } }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.auth || {};
  const commonT = dict?.common || {};
  const errorsT = dict?.errors || {};
  
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${locale}`);
    }
    return () => clearError();
  }, [isAuthenticated, router, locale, clearError]);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      router.push(`/${locale}/login?registered=true`);
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="logo w-16 h-16 mx-auto mb-4">
              <span className="logo-text text-3xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{t.registerTitle}</h1>
            <p className="text-gray-400 mt-2">{t.registerSubtitle}</p>
          </div>

          <div className="card p-8 bg-dark-800 border-dark-600">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label={t.name}
                type="text"
                placeholder="John Doe"
                icon={User}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label={t.email}
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message || errorsT.invalidEmail}
                {...register('email')}
              />

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

              <Input
                label={t.confirmPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword?.message || errorsT.passwordMatch}
                {...register('confirmPassword')}
              />

              {/* Account Type Selection */}
              <div>
                <label className="label text-gray-300">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all",
                    "border-dark-600 hover:border-brand-red/50 hover:bg-dark-700/50",
                    "data-[selected=true]:border-brand-red data-[selected=true]:bg-brand-red/10"
                  )}>
                    <input
                      type="radio"
                      value="customer"
                      {...register('role')}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      "bg-dark-700 group-data-[selected=true]:bg-brand-red/20"
                    )}>
                      <ShoppingCart className="w-5 h-5 text-gray-400 group-data-[selected=true]:text-brand-red" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">Customer</span>
                    <span className="text-xs text-gray-500">Shop & buy</span>
                  </label>
                  
                  <label className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all",
                    "border-dark-600 hover:border-brand-red/50 hover:bg-dark-700/50",
                    "data-[selected=true]:border-brand-red data-[selected=true]:bg-brand-red/10"
                  )}>
                    <input
                      type="radio"
                      value="trader"
                      {...register('role')}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      "bg-dark-700 group-data-[selected=true]:bg-brand-red/20"
                    )}>
                      <Store className="w-5 h-5 text-gray-400 group-data-[selected=true]:text-brand-red" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">Trader</span>
                    <span className="text-xs text-gray-500">Sell products</span>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                className="mt-2"
              >
                {t.signUp}
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              {t.hasAccount}{' '}
              <Link href={`/${locale}/login`} className="text-brand-red hover:text-brand-red-light font-medium">
                {t.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}