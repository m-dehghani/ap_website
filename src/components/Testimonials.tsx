import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { TESTIMONIALS, TESTIMONIAL_STATS } from '@/constants/content';

const Testimonials: React.FC = () => {
  const testimonials = TESTIMONIALS;
  const stats = TESTIMONIAL_STATS;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
              نظرات بازیکنان
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              نظرات بازیکنان ما
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              داستان‌های واقعی از بازیکنان و والدین واقعی که تفاوت آکادمی ما را
              در مسیر فوتبال خود تجربه کرده‌اند.
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600 opacity-50" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center">
                {testimonial.image &&
                !testimonial.image.startsWith('/api/placeholder/') ? (
                  <img
                    src={testimonial.image}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover ml-4"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold ml-4"
                  >
                    {testimonial.name.trim().charAt(0)}
                  </div>
                )}
                <div className="text-right">
                  <h3 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Success Stories Stats */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              داستان‌های موفقیت
            </h3>
            <p className="text-gray-600">
              بازیکنان ما به اهدافشان می‌رسند و انتظارات را پشت سر می‌گذارند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2 persian-numbers">
                  {stat.number}
                </div>
                <div className="text-gray-900 font-medium">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-linear-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              آماده نوشتن داستان موفقیت خود هستید؟
            </h3>
            <p className="text-primary-100 mb-6">
              به صدها بازیکن بپیوندید که بازی خود را در آکادمی فوتبال افشین
              پیروانی متحول کرده‌اند.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                سفر خود را شروع کنید
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 backdrop-blur-sm"
              >
                بازدید برنامه‌ریزی کنید
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
