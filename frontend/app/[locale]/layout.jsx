import '../globals.css';
import { getDictionary } from '@/i18n';
import { Toaster } from 'sonner';

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Smart Technology'} - Premium E-Commerce`,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Shop the latest technology products with premium quality',
  keywords: 'ecommerce, technology, gadgets, electronics',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default function RootLayout({ children, params: { locale = 'en' } }) {
  const dict = getDictionary(locale);
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
        <Toaster 
          position={locale === 'ar' ? 'top-left' : 'top-right'}
          richColors
        />
        {children}
      </body>
    </html>
  );
}