
'use client';

import { Navbar } from '@/components';
import { Footer } from '@/components';
import { Mail, Phone, MapPin, Clock, Facebook } from '@/components/icons';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ContactPage() {
  const pathname = usePathname();
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    setIsArabic(pathname?.startsWith('/ar'));
  }, [pathname]);

  const translations = {
    en: {
      address: "Jerusalem - Abu Dis, Water Association Building",
      email: "smart_tech2008@hotmail.com",
      phone: "+972 56-835-6505",
      hours: "Sunday - Thursday: 8:00 AM - 4:00 PM",
      addressTitle: "Address",
      emailTitle: "Email",
      phoneTitle: "Phone",
      hoursTitle: "Business Hours",
      title: "Contact Us",
      subtitle: "Have questions? We would love to hear from you.",
      infoTitle: "Contact Information"
    },
    ar: {
      address: "القدس - ابو ديس، مبنى جمعية المياه",
      email: "smart_tech2008@hotmail.com",
      phone: "+972 56-835-6505",
      hours: "الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً",
      addressTitle: "العنوان",
      emailTitle: "البريد الإلكتروني",
      phoneTitle: "الهاتف",
      hoursTitle: "أوقات العمل",
      title: "اتصل بنا",
      subtitle: "لديك أسئلة؟ نود أن نسمع منك.",
      infoTitle: "معلومات الاتصال"
    }
  };

  const tr = translations[isArabic ? 'ar' : 'en'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {tr.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {tr.subtitle}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {tr.infoTitle}
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tr.addressTitle}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {tr.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tr.emailTitle}
                    </h3>
                    <a 
                      href={`mailto:${tr.email}`} 
                      className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      {tr.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tr.phoneTitle}
                    </h3>
                    <a 
                      href={`tel:${tr.phone.replace(/\s/g, '')}`} 
                      className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      {tr.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tr.hoursTitle}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {tr.hours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/whatsapp.png" 
                      alt="WhatsApp" 
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isArabic ? 'واتساب' : 'WhatsApp'}
                    </h3>
                    <a 
                      href="https://wa.me/972568356505" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      +972 56-835-6505
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isArabic ? 'فيسبوك' : 'Facebook'}
                    </h3>
                    <a 
                      href="https://www.facebook.com/share/1CbctLX9dA/?mibextid=wwXIfr" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Smart Technology
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}