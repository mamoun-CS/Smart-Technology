'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { authAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { toast } from 'sonner';

export default function ForgotPassword({ params: { locale = 'en' } }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const dict = getDictionary(locale);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(locale === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      setIsSubmitted(true);
      toast.success(locale === 'ar' 
        ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' 
        : 'Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 
        (locale === 'ar' 
          ? 'فشل في إرسال رابط إعادة التعيين' 
          : 'Failed to send reset link'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-700 via-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </h1>
          <p className="text-gray-500 text-center mb-6">
            {locale === 'ar' 
              ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين' 
              : 'Enter your email to receive a reset link'}
          </p>

          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-lg mb-2">
                {locale === 'ar' ? 'تم إرسال البريد الإلكتروني!' : 'Email sent!'}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {locale === 'ar' 
                  ? 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين' 
                  : 'Check your email for the reset link'}
              </p>
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="btn-primary w-full"
              >
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {locale === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* Back to Login */}
          {!isSubmitted && (
            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/login`}
                className="text-primary-600 hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}