import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'ایمیل یا شماره تلفن را وارد کنید'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.identifier, data.password);
      toast.success('ورود با موفقیت انجام شد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در ورود');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      title="ورود - آکادمی فوتبال AP"
      description="ورود به پنل کاربری آکادمی فوتبال AP"
      canonical="https://ap-football.com/login"
    >
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-8 py-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  ورود به حساب کاربری
                </h1>
                <p className="text-primary-100">برای دسترسی به پنل خود وارد شوید</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email or phone */}
                <div>
                  <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700 mb-2">
                    ایمیل یا شماره تلفن *
                  </label>
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    {...register('identifier')}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="ایمیل یا شماره تلفن خود را وارد کنید"
                  />
                  {errors.identifier && (
                    <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور *
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="رمز عبور خود را وارد کنید"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'در حال ورود...' : 'ورود'}
                </button>

                {/* Links */}
                <div className="text-center space-y-2">
                  <Link
                    href="/register"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    هنوز حساب کاربری ندارید؟ ثبت نام کنید
                  </Link>
                  <Link
                    href="/contact"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    برای بازیابی رمز عبور با آکادمی تماس بگیرید
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;