'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Store, ShoppingCart, Phone } from '@/components/icons';
import { useAuthStore } from '@/store';
import { getDictionary } from '@/i18n';
import { cn } from '@/lib';
import { Navbar } from '@/components';
import { Button } from '@/components';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(9, 'Phone must be 9 digits starting with 59').max(9, 'Phone must be 9 digits').refine(
    (val) => val.startsWith('59'),
    { message: 'Phone must start with 59' }
  ),
  countryCode: z.enum(['+970', '+972']).default('+970'),
  role: z.enum(['customer', 'trader']).default('customer'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterPage({ params: { locale = 'en' } }) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [countryCode, setCountryCode] = useState('+970');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.auth || {};
  const commonT = dict?.common || {};
  const errorsT = dict?.errors || {};
  
  const { isAuthenticated, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
      countryCode: '+970',
      email: '',
    },
  });

  const phoneValue = watch('phone');

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${locale}`);
    }
    return () => clearError();
  }, [isAuthenticated, router, locale, clearError]);

  useEffect(() => {
    localStorage.removeItem('pendingRegistration');
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    const registrationData = {
      name: data.name,
      email: data.email || undefined,
      password: data.password,
      role: data.role,
      phone: data.phone,
      countryCode: data.countryCode,
      phoneVerified: false,
    };
    
    localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
    router.push(`/${locale}/verify`);
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
            <h1 className="text-3xl font-bold text-white">{t.registerTitle}</h1>
            <p className="text-gray-400 mt-2">{t.registerSubtitle}</p>
          </div>

          <div className="card p-8 bg-dark-800 border-dark-600">
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
                placeholder="you@example.com (optional)"
                icon={Mail}
                error={errors.email?.message || errorsT.invalidEmail}
                {...register('email')}
              />

              <div>
                <label className="label text-gray-300">Phone Number (WhatsApp)</label>
                <div className="flex gap-2">
                  <div className="relative w-28">
                    <select
                      {...register('countryCode')}
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setValue('countryCode', e.target.value);
                      }}
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
                      {...register('phone')}
                      placeholder="59 ********"
                      className="input pl-10 bg-dark-700 border-dark-600 text-white"
                      maxLength={9}
                    />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.phone.message}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Enter 9 digits starting with 59</p>
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

              <Input
                label={t.confirmPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword?.message || errorsT.passwordMatch}
                {...register('confirmPassword')}
              />

              <div>
                <label className="label text-gray-300">Account Type</label>
                <div className="relative grid grid-cols-2 gap-3 p-1 bg-dark-700 rounded-xl">
                  <div className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-red rounded-lg transition-all duration-300 ease-in-out",
                    selectedRole === 'customer' ? 'left-1' : 'left-[calc(50%+2px)]'
                  )} />
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('customer');
                      setValue('role', 'customer');
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all z-10",
                      selectedRole === 'customer' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      selectedRole === 'customer' ? 'bg-white/20' : 'bg-dark-600'
                    )}>
                      <ShoppingCart className={cn(
                        "w-5 h-5 transition-colors",
                        selectedRole === 'customer' ? 'text-white' : 'text-gray-400'
                      )} />
                    </div>
                    <span className="text-sm font-medium">Customer</span>
                    <span className={cn(
                      "text-xs",
                      selectedRole === 'customer' ? 'text-white/80' : 'text-gray-500'
                    )}>Shop & buy</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('trader');
                      setValue('role', 'trader');
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all z-10",
                      selectedRole === 'trader' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      selectedRole === 'trader' ? 'bg-white/20' : 'bg-dark-600'
                    )}>
                      <Store className={cn(
                        "w-5 h-5 transition-colors",
                        selectedRole === 'trader' ? 'text-white' : 'text-gray-400'
                      )} />
                    </div>
                    <span className="text-sm font-medium">Trader</span>
                    <span className={cn(
                      "text-xs",
                      selectedRole === 'trader' ? 'text-white/80' : 'text-gray-500'
                    )}>Sell products</span>
                  </button>
                </div>
                <input type="hidden" {...register('role')} value={selectedRole} />
              </div>

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isSubmitting}
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