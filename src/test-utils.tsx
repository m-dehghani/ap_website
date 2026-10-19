import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mock providers that are commonly needed
const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div dir="rtl" lang="fa">{children}</div>
);

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: Providers, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };

// Test data factories
export const createMockCoach = (overrides = {}) => ({
  id: 'coach-1',
  firstName: 'علی',
  lastName: 'محمدی',
  email: 'ali.mohammadi@example.com',
  phone: '09123456789',
  specialization: 'مربی فیفا، تخصص در نوجوانان',
  experience: 10,
  title: 'مربی ارشد',
  bio: 'تجربه ۱۰ ساله در آموزش فوتبال',
  quote: 'فوتبال هنری است، نه فقط ورزش',
  certifications: ['گواهی فیفا C', 'گواهی AFC B'],
  achievements: ['قهرمان لیگ برتر', 'بهترین مربی سال'],
  rating: 4.8,
  studentsCount: 150,
  image: '/images/coach1.jpg',
  instagram: '@ali_mohammadi',
  twitter: '@ali_mohammadi',
  isActive: true,
  displayOrder: 0,
  programs: [],
  ...overrides,
});

export const createMockProgram = (overrides = {}) => ({
  id: 'program-1',
  name: 'فصل فوتبال نوجوانان',
  description: 'برنامه جامع آموزش فوتبال برای نوجوانان',
  price: 5000000,
  duration: 3,
  sessionCount: 24,
  maxStudents: 15,
  popular: true,
  icon: '⚽',
  ageRange: '12-15 سال',
  minAge: 12,
  maxAge: 15,
  color: '#3B82F6',
  period: 'فصلی',
  rating: 4.5,
  studentsEnrolled: 10,
  features: ['تمرینات تکنیک', 'تمرینات تاکتیک', 'بازی دوستانه'],
  level: 'BEGINNER',
  isActive: true,
  displayOrder: 0,
  createdAt: new Date().toISOString(),
  coach: createMockCoach(),
  schedule: [
    { id: 'sched-1', day: 'شنبه', time: '17:00', displayOrder: 0 },
    { id: 'sched-2', day: 'سه‌شنبه', time: '17:00', displayOrder: 1 },
  ],
  ...overrides,
});

export const createMockRegistration = (overrides = {}) => ({
  id: 'reg-1',
  status: 'PENDING',
  totalAmount: 5000000,
  paidAmount: 0,
  experienceLevel: 'BEGINNER',
  parentName: 'احمد محمدی',
  parentEmail: 'parent@example.com',
  emergencyContactName: 'مهدی محمدی',
  emergencyContactPhone: '09123456788',
  medicalConditions: 'بدون حساسیت',
  registeredAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  user: {
    id: 'user-1',
    firstName: 'رضا',
    lastName: 'محمدی',
    email: 'reza.mohammadi@example.com',
    phone: '09123456787',
    birthDate: '2010-01-01T00:00:00.000Z',
  },
  program: {
    id: 'program-1',
    name: 'فصل فوتبال نوجوانان',
    price: 5000000,
    coach: {
      firstName: 'علی',
      lastName: 'محمدی',
    },
  },
  payments: [],
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: 'session-1',
  name: 'تمرین هفته اول',
  description: 'تمرینات پایه وricao',
  date: new Date(Date.now() + 86400000).toISOString(),
  duration: 90,
  location: 'زمین اصلی',
  maxCapacity: 15,
  status: 'SCHEDULED',
  createdAt: new Date().toISOString(),
  program: { id: 'program-1', name: 'فصل فوتبال نوجوانان' },
  coach: { id: 'coach-1', firstName: 'علی', lastName: 'محمدی' },
  attendance: [],
  ...overrides,
});

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create form data
export const createFormData = (data: Record<string, string | Blob>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};