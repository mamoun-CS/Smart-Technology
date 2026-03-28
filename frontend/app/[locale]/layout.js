import '../globals.css';
import { getDictionary } from '@/i18n';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Smart Technology - Premium E-Commerce',
  description: 'Shop the latest technology products with premium quality',
  keywords: 'ecommerce, technology, gadgets, electronics',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default function RootLayout({ children, params: { locale = 'en' } }) {
  const dict = getDictionary(locale);
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster 
          position={locale === 'ar' ? 'top-left' : 'top-right'}
          richColors
        />
        {children}
      </body>
    </html>
  );
}