'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Phone, MessageSquare, ArrowLeft, CheckCircle } from '@/components/icons';
import { useAuthStore } from '@/store';
import { getDictionary } from '@/i18n';
import { Navbar } from '@/components';
import { Button } from '@/components';
import { Input } from '@/components/ui/Input';
import { otpAPI, authAPI } from '@/lib/api';

const verifySchema = z.object({
  otpCode: z.string().length(6, 'Code must be 6 digits'),
});

export default function VerifyPage({ params: { locale = 'en' } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.auth || {};
  const commonT = dict?.common || {};
  
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const dataRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    const storedData = localStorage.getItem('pendingRegistration');
    if (storedData) {
      dataRef.current = JSON.parse(storedData);
      sendInitialOTP();
    } else {
      router.push(`/${locale}/register`);
    }
  }, [locale, router]);

  const sendInitialOTP = async () => {
    if (!dataRef.current) return;
    
    try {
      await otpAPI.sendOTP({
        phone: dataRef.current.phone,
        countryCode: dataRef.current.countryCode,
      });
      setResendCountdown(30);
    } catch (err) {
      console.error('Failed to send OTP:', err);
    }
  };

  useEffect(() => {
    let interval;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const onSubmit = async (formData) => {
    if (!dataRef.current) {
      setOtpError('Registration data not found. Please register again.');
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    try {
      await otpAPI.verifyOTP({
        phone: dataRef.current.phone,
        countryCode: dataRef.current.countryCode,
        otpCode: formData.otpCode,
      });

      try {
        await registerUser(dataRef.current);
        localStorage.removeItem('pendingRegistration');
        setRegistrationSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/login?registered=true`);
        }, 2000);
      } catch (err) {
        setOtpError(err.response?.data?.message || 'Registration failed');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !dataRef.current) return;
    
    try {
      await otpAPI.sendOTP({
        phone: dataRef.current.phone,
        countryCode: dataRef.current.countryCode,
      });
      setResendCountdown(30);
      setOtpError('');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleChangePhone = () => {
    localStorage.removeItem('pendingRegistration');
    router.push(`/${locale}/register`);
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md px-4 text-center">
            <div className="card p-8 bg-dark-800 border-dark-600">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
              <p className="text-gray-400">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const phone = dataRef.current?.phone || '';
  const countryCode = dataRef.current?.countryCode || '+970';

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-4">
          <button
            onClick={handleChangePhone}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to registration</span>
          </button>

          <div className="text-center mb-8">
            <img
              src="/images/logo.png"
              alt="Smart Technology Logo"
              className="h-14 w-auto mx-auto mb-4 object-contain"
              loading="eager"
            />
            <h1 className="text-3xl font-bold text-white">{t.verifyTitle || 'Verify Account'}</h1>
            <p className="text-gray-400 mt-2">{t.verifySubtitle || 'Enter the code sent to your WhatsApp'}</p>
          </div>

          <div className="card p-8 bg-dark-800 border-dark-600">
            <div className="flex items-center gap-3 mb-6 p-4 bg-dark-700 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">WhatsApp Number</p>
                <p className="text-white font-medium">
                  +{countryCode} {phone.slice(0, 2)}****{phone.slice(-4)}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {otpError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {otpError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                icon={Lock}
                error={errors.otpCode?.message}
                {...register('otpCode')}
                maxLength={6}
              />

              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading || isVerifying}
                  className="mt-2"
                >
                  {t.createAccount || 'Create Account'}
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleChangePhone}
                    className="flex-1"
                  >
                    {t.changePhone || 'Change Phone'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={handleResend}
                    disabled={resendCountdown > 0}
                    className="flex-1"
                  >
                    {resendCountdown > 0 
                      ? `${resendCountdown}s` 
                      : t.resendCode || 'Resend'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}