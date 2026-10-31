import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CoachEvaluationsPanel from '@/components/CoachEvaluationsPanel';

describe('coach evaluation panel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows coach evaluations and labelled scores bounded from 1 to 10', () => {
    render(
      <CoachEvaluationsPanel
        students={[{ id: 'student-1', firstName: 'علی', lastName: 'رضایی' }]}
        evaluations={[
          {
            id: 'evaluation-1',
            user: { firstName: 'سارا', lastName: 'محمدی' },
            technical: 8,
            physical: 7,
            mental: 9,
            teamwork: 8,
            overall: 8,
            notes: 'پیشرفت خوب',
            createdAt: '2026-10-25T10:00:00.000Z',
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'ارزیابی بازیکنان' }),
    ).toBeInTheDocument();
    const form = screen.getByRole('form', { name: 'ثبت ارزیابی بازیکن' });
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('action', '/api/coach/evaluations');
    expect(screen.getByText('سارا محمدی')).toBeInTheDocument();
    for (const label of ['فنی', 'بدنی', 'ذهنی', 'کار تیمی', 'ارزیابی کلی']) {
      expect(screen.getByLabelText(label)).toHaveAttribute('min', '1');
      expect(screen.getByLabelText(label)).toHaveAttribute('max', '10');
    }
    expect(screen.getByLabelText('یادداشت')).toBeInTheDocument();
  });

  it('announces successful saves accessibly', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        evaluation: {
          id: 'evaluation-2',
          user: { firstName: 'علی', lastName: 'رضایی' },
          technical: 5,
          physical: 5,
          mental: 5,
          teamwork: 5,
          overall: 5,
          notes: null,
          createdAt: '2026-10-25T10:00:00.000Z',
        },
      }),
    } as Response);
    render(
      <CoachEvaluationsPanel
        students={[{ id: 'student-1', firstName: 'علی', lastName: 'رضایی' }]}
        evaluations={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText('دانش‌آموز'), {
      target: { value: 'student-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ثبت ارزیابی' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'ارزیابی با موفقیت ثبت شد',
      );
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/coach/evaluations',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
