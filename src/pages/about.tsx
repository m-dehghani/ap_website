import React from 'react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import { TrophyIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  ABOUT_STORY,
  ABOUT_MISSION,
  ABOUT_VISION,
  ABOUT_VALUES,
  ABOUT_STATISTICS,
  ABOUT_TEAM,
  ABOUT_FACILITIES,
} from '@/constants/content';

const AboutPage: React.FC = () => {
  return (
    <Layout
      title="درباره ما - آکادمی فوتبال افشین پیروانی"
      description="آکادمی فوتبال افشین پیروانی با هدف آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران تأسیس شده است. بیش از 10 سال تجربه در آموزش فوتبال."
      canonical="https://ap-football.com/about"
      openGraph={{
        title: 'درباره ما - آکادمی فوتبال افشین پیروانی',
        description:
          'آکادمی فوتبال افشین پیروانی با هدف آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران تأسیس شده است',
        images: [
          {
            url: 'https://ap-football.com/images/about-og.jpg',
            width: 1200,
            height: 630,
            alt: 'درباره آکادمی فوتبال افشین پیروانی',
          },
        ],
      }}
    >
      <PageHero
        title="درباره آکادمی فوتبال افشین پیروانی"
        description="بیش از یک دهه تجربه در آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران"
        badge="درباره ما"
      />

      <div className="section-padding bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container-custom">
          {/* Story Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="card-glass p-8 rounded-4xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                داستان ما
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                {ABOUT_STORY.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="card-glass p-6 rounded-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <TrophyIcon className="w-8 h-8 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {ABOUT_MISSION.title}
                  </h3>
                </div>
                <p className="text-gray-700">{ABOUT_MISSION.description}</p>
              </div>

              <div className="card-glass p-6 rounded-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <StarIcon className="w-8 h-8 text-secondary-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {ABOUT_VISION.title}
                  </h3>
                </div>
                <p className="text-gray-700">{ABOUT_VISION.description}</p>
              </div>

              <div className="card-glass p-6 rounded-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <HeartIcon className="w-8 h-8 text-accent-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {ABOUT_VALUES.title}
                  </h3>
                </div>
                <ul className="text-gray-700 space-y-2 mr-4">
                  {ABOUT_VALUES.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {ABOUT_STATISTICS.map((stat, index) => (
              <div
                key={index}
                className="card-glass p-8 rounded-4xl text-center"
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-900 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="card-glass p-8 rounded-4xl mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              تیم مدیریت
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ABOUT_TEAM.map((member, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`w-32 h-32 bg-linear-to-br ${member.bgColor} rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4`}
                  >
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="card-glass p-8 rounded-4xl mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              امکانات ما
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  زمین‌های تمرین
                </h3>
                <ul className="text-gray-700 space-y-2 mr-4">
                  {ABOUT_FACILITIES.pitches.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">تجهیزات</h3>
                <ul className="text-gray-700 space-y-2 mr-4">
                  {ABOUT_FACILITIES.equipment.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Block */}
          <div className="bg-linear-to-r from-primary-600 to-primary-700 rounded-4xl p-10 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">
              آماده پیوستن به ما هستید؟
            </h3>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              همین امروز ثبت نام کنید و سفر فوتبالی خود را با بهترین مربیان آغاز
              کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-primary-700 font-bold px-8 py-3 rounded-2xl hover:bg-primary-50 transition-colors duration-200"
              >
                ثبت نام همین حالا
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-2xl hover:bg-white/10 transition-colors duration-200"
              >
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
