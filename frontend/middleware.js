import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Check if there's a locale in the pathname
  const pathnameIsMissingLocale = ['/en', '/ar'].every(
    (locale) => !pathname.startsWith(locale) && pathname !== locale
  );

  // Redirect if there's no locale
  if (pathnameIsMissingLocale) {
    // You can set default locale here
    const locale = 'en';
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)',
  ],
};