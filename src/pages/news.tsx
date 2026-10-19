import React, { useState } from 'react';
import Layout from '../components/Layout';
import EnhancedNewsUpdates from '../components/EnhancedNewsUpdates';
import FootballNewsDashboard from '../components/FootballNewsDashboard';
import {
  NewspaperIcon,
  GlobeAltIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

const NewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mixed' | 'dashboard'>('mixed');

  return (
    <Layout
      title="اخبار و رویدادها - آکادمی فوتبال افشین پیروانی"
      description="آخرین اخبار آکادمی فوتبال افشین پیروانی و دنیای فوتبال ایران. اخبار انتقالات، نتایج بازی‌ها، و رویدادهای آکادمی."
      canonical="https://ap-football.com/news"
      openGraph={{
        title: 'اخبار و رویدادها - آکادمی فوتبال افشین پیروانی',
        description:
          'آخرین اخبار آکادمی فوتبال افشین پیروانی و دنیای فوتبال ایران',
        images: [
          {
            url: 'https://ap-football.com/images/news-og.jpg',
            width: 1200,
            height: 630,
            alt: 'اخبار آکادمی فوتبال افشین پیروانی',
          },
        ],
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-linear-to-br from-gray-500 to-primary-900 text-white py-16">
          <div className="container-custom">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                مرکز اخبار آکادمی فوتبال افشین پیروانی
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                آخرین اخبار آکادمی، دنیای فوتبال ایران و تحلیل‌های تخصصی
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container-custom">
            <div
              className="flex justify-center space-x-8 space-x-reverse"
              role="group"
              aria-label="نمایش اخبار"
            >
              <button
                type="button"
                onClick={() => setActiveTab('mixed')}
                aria-pressed={activeTab === 'mixed'}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'mixed'
                    ? 'border-primary-700 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <HomeIcon className="w-5 h-5 ml-2" />
                  اخبار ترکیبی
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                aria-pressed={activeTab === 'dashboard'}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-primary-700 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <GlobeAltIcon className="w-5 h-5 ml-2" />
                  دشبورد فوتبال
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-8">
          {activeTab === 'mixed' ? (
            <EnhancedNewsUpdates />
          ) : (
            <FootballNewsDashboard />
          )}
        </div>

        {/* Additional Features */}
        <div className="bg-linear-to-br from-mauve-400 to-navy-600 text-white py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">ویژگی‌های خبری ما</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                مرکز اخبار آکادمی فوتبال افشین پیروانی با هوش مصنوعی، آخرین
                اخبار فوتبال را تحلیل و ارائه می‌دهد
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <NewspaperIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">تحلیل هوشمند</h3>
                <p className="text-white/80">
                  هوش مصنوعی اخبار را تحلیل کرده و مهم‌ترین موضوعات را شناسایی
                  می‌کند
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GlobeAltIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">منابع معتبر</h3>
                <p className="text-white/80">
                  از بهترین منابع خبری کشور مانند ورزش سه، فوتبال ایران و ایسنا
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">اخبار آکادمی</h3>
                <p className="text-white/80">
                  آخرین اخبار، رویدادها و دستاوردهای آکادمی فوتبال افشین پیروانی
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsPage;
