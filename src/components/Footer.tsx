import React from 'react';
import Link from 'next/link';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  APP_CONFIG,
  NAVIGATION,
  FOOTER_SOCIAL_LINKS,
  FOOTER_TRAINING_HOURS,
} from '@/constants/app';
import { CTA_CONTENT } from '@/constants/content';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = FOOTER_SOCIAL_LINKS;
  const quickLinks = NAVIGATION.footer.quickLinks;
  const programs = NAVIGATION.footer.programs;
  const legalLinks = NAVIGATION.footer.legal;
  const trainingHours = FOOTER_TRAINING_HOURS;

  return (
    <footer className="bg-linear-to-br from-navy-900 via-navy-800 to-navy-900 text-white relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-pattern-dots animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 bg-accent-200/5 backdrop-blur-sm">
        {/* Main Footer Content */}
        <div className="container-custom py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Enhanced Company Info */}
            <div className="lg:col-span-2 space-y-6 bg-blue-950/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-elegant-lg">
                  ⚽
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    آکادمی فوتبال افشین پیروانی
                  </h3>
                  <p className="text-gray-200 font-medium">
                    جایی که قهرمانان ساخته می‌شوند
                  </p>
                </div>
              </div>

              <p className="text-gray-200 text-lg leading-relaxed max-w-md">
                {APP_CONFIG.description}
              </p>

              {/* Enhanced Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                    <PhoneIcon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <a
                      href={`tel:${APP_CONFIG.phone.replace(/[^\d+]/g, '')}`}
                      className="text-white font-medium hover:underline"
                    >
                      {APP_CONFIG.phone}
                    </a>
                    <p className="text-gray-300 text-sm">24 ساعته در دسترس</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                    <EnvelopeIcon className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div>
                    <a
                      href={`mailto:${APP_CONFIG.email}`}
                      className="text-white font-medium hover:underline"
                    >
                      {APP_CONFIG.email}
                    </a>
                    <p className="text-gray-300 text-sm">پاسخ سریع تضمینی</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                    <MapPinIcon className="w-6 h-6 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {APP_CONFIG.address}
                    </p>
                    <p className="text-gray-300 text-sm">{APP_CONFIG.city}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Social Links */}
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-white/20 hover:border-white/30"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Enhanced Quick Links */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-white flex items-center">
                <span className="text-white">لینک‌های سریع</span>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group py-2"
                    >
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Programs */}
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white flex items-center">
                <span className="text-white">برنامه‌های آموزشی</span>
              </h4>
              <ul className="space-y-3">
                {programs.map((program, index) => (
                  <li key={index}>
                    <Link
                      href={program.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group py-2"
                    >
                      <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {program.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Enhanced Training Hours */}
              <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <h5 className="text-white font-semibold mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-accent-400" />
                  ساعات تمرین
                </h5>
                <div className="space-y-3 text-sm">
                  {trainingHours.map((hour, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400">{hour.days}</span>
                      <span className="text-white font-medium">
                        {hour.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Newsletter Section */}
        <div className="border-t border-white/10">
          <div className="container-custom py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {CTA_CONTENT.title}
                </h3>
                <p className="text-gray-300 text-lg">
                  {CTA_CONTENT.description}
                </p>
              </div>
              <div className="flex sm:justify-end">
                <Link href="/programs" className="btn btn-secondary">
                  مشاهده برنامه‌ها و ثبت‌نام
                  <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container-custom py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center gap-2">
                <p className="text-gray-400">
                  © {currentYear} {APP_CONFIG.name}. تمام حقوق محفوظ است.
                </p>
                <span className="text-gray-600">•</span>
                <p className="text-gray-400 flex items-center">
                  با <HeartIcon className="w-4 h-4 text-red-500 mx-1" /> برای
                  فوتبال ساخته شده
                </p>
              </div>

              <div className="flex gap-6">
                {legalLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
