import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import StudentDashboardPage from '@/pages/student/dashboard';

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/PersianDatePicker', () => ({ default: () => null }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'STUDENT' },
    loading: false,
    refreshUser: vi.fn(),
  }),
}));

describe('student attendance history UI', () => {
  it('shows the signed-in student’s attendance status and session', () => {
    render(
      <StudentDashboardPage
        student={{
          id: 'student-1',
          email: null,
          firstName: 'علی',
          lastName: 'رضایی',
          phone: null,
          birthDate: null,
          marketingOptIn: false,
          registrations: [],
          attendance: [
            {
              id: 'attendance-1',
              status: 'LATE',
              createdAt: '2026-10-25T10:00:00.000Z',
              session: {
                id: 'session-1',
                name: 'تمرین پایه',
                date: '2026-10-25T09:00:00.000Z',
                program: { name: 'آموزش فوتبال' },
              },
            },
          ],
          evaluations: [
            {
              id: 'evaluation-1',
              technical: 8,
              physical: 7,
              mental: 9,
              teamwork: 8,
              overall: 8,
              notes: 'پیشرفت خوب',
              createdAt: '2026-10-25T10:00:00.000Z',
              coach: { firstName: 'مهدی', lastName: 'کریمی' },
            },
          ],
        }}
        programs={[]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'سابقه حضور و غیاب' }),
    ).toBeInTheDocument();
    expect(screen.getByText('تمرین پایه')).toBeInTheDocument();
    expect(screen.getByText('با تأخیر')).toBeInTheDocument();
    const evaluationsHeading = screen.getByRole('heading', {
      name: 'ارزیابی‌های من',
    });
    expect(evaluationsHeading).toBeInTheDocument();
    expect(screen.getByText('پیشرفت خوب')).toBeInTheDocument();
    expect(
      evaluationsHeading.closest('section')?.querySelector('form'),
    ).toBeNull();
  });
});
