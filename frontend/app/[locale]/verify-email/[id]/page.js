'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { authAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';

export default function VerifyEmail({ params: { locale = 'en' } }) {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const token = params.id;
  const dict = getDictionary(locale);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage(locale === 'ar' 
        ? 'تم التحقق من بريدك الإلكتروني بنجاح!' 
        : 'Your email has been verified successfully!');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 
        (locale === 'ar' 
          ? 'فشل التحقق من البريد الإلكتروني' 
          : 'Failed to verify email'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-700 via-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">
            {locale === 'ar' ? 'التحقق من البريد الإلكتروني' : 'Email Verification'}
          </h1>

          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <p className={`text-lg mb-6 ${
            status === 'success' ? 'text-green-600' :
            status === 'error' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {message || (locale === 'ar' ? 'جاري التحقق...' : 'Verifying...')}
          </p>

          {/* Action Button */}
          {status === 'success' && (
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="btn-primary w-full"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Go to Login'}
            </button>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="btn-primary w-full"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Go to Login'}
              </button>
              <button
                onClick={() => router.push(`/${locale}/register`)}
                className="btn-secondary w-full"
              >
                {locale === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
              </button>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-gray-500">
              {locale === 'ar' 
                ? 'يرجى الانتظار...' 
                : 'Please wait...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}