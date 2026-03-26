'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { toast } from 'sonner';

export default function ResetPassword({ params: { locale = 'en' } }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const token = params.id;
  const dict = getDictionary(locale);

  useEffect(() => {
    if (token) {
      setStatus('ready');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error(locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    try {
      await authAPI.resetPassword({ token, password });
      setStatus('success');
      setMessage(locale === 'ar' 
        ? 'تم إعادة تعيين كلمة المرور بنجاح!' 
        : 'Password has been reset successfully!');
      toast.success(locale === 'ar' ? 'تم تحديث كلمة المرور' : 'Password updated');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 
        (locale === 'ar' 
          ? 'فشل في إعادة تعيين كلمة المرور' 
          : 'Failed to reset password'));
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-700 via-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-center mb-6">
            {locale === 'ar' 
              ? 'أدخل كلمة المرور الجديدة الخاصة بك' 
              : 'Enter your new password'}
          </p>

          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">
                {locale === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-lg mb-4">{message}</p>
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="btn-primary w-full"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Go to Login'}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg mb-4">{message}</p>
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="btn-primary w-full"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Go to Login'}
              </button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full pr-10"
                    placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input w-full"
                  placeholder={locale === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Back to Login */}
          {status === 'ready' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="text-primary-600 hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}