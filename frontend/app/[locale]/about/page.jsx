'use client';

import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components';
import { Footer } from '@/components';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.title', 'About Smart Technology')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about.subtitle', 'Your trusted partner for smart devices and technology solutions')}
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.mission.title', 'Our Mission')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('about.mission.description', 'At Smart Technology, we are committed to bringing you the latest and most innovative smart devices at competitive prices. Our mission is to make technology accessible to everyone, whether you are a retail customer looking for the newest gadgets or a merchant seeking wholesale opportunities.')}
            </p>
          </div>

          {/* Values Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('about.values.quality.title', 'Quality Products')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.values.quality.description', 'We source only the highest quality smart devices from trusted manufacturers and brands.')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('about.values.pricing.title', 'Competitive Pricing')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.values.pricing.description', 'We offer both retail and wholesale pricing to meet the needs of all our customers.')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('about.values.support.title', '24/7 Support')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.values.support.description', 'Our dedicated support team is always ready to help you with any questions or concerns.')}
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.team.title', 'Our Team')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('about.team.description', 'Our team consists of technology enthusiasts and industry experts who are passionate about bringing you the best smart devices. We work tirelessly to ensure that our customers have access to the latest innovations and receive exceptional service.')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
