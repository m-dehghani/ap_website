import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import type { TestimonialViewModel } from '@/types/viewModels/content';

interface TestimonialsProps {
  testimonials: TestimonialViewModel[];
}

const TestimonialsComponent: React.FC<TestimonialsProps> = ({
  testimonials,
}) => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
              دیدگاه‌ها
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:text-4xl">
              نظرات و تجربه‌ها
            </h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto sm:text-lg">
              دیدگاه‌های ثبت‌شده درباره تجربه حضور در آکادمی.
            </p>
          </motion.div>
        </div>

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
              <div className="mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600 opacity-50" />
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

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

        {testimonials.length === 0 && (
          <p className="mt-10 text-center text-gray-600">
            هنوز دیدگاهی برای نمایش ثبت نشده است.
          </p>
        )}
      </div>
    </section>
  );
};

export default TestimonialsComponent;
