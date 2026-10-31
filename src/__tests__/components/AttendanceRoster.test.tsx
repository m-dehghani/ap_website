import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AttendanceRoster from '@/components/AttendanceRoster';

describe('AttendanceRoster', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ attendance: [] }),
      }),
    );
  });

  it('submits each selected Persian attendance status and announces success', async () => {
    render(
      <AttendanceRoster
        sessionId="session-1"
        endpoint="/api/admin/sessions/session-1/attendance"
        roster={[
          {
            userId: 'student-1',
            firstName: 'علی',
            lastName: 'رضایی',
            status: null,
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'EXCUSED' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ذخیره حضور و غیاب' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/sessions/session-1/attendance',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            attendance: [{ userId: 'student-1', status: 'EXCUSED' }],
          }),
        }),
      );
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'وضعیت حضور ثبت شد',
    );
  });

  it('shows an accessible error when the attendance save is rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'ذخیره ناموفق بود' }),
      }),
    );
    render(
      <AttendanceRoster
        sessionId="session-1"
        endpoint="/api/coach/sessions/session-1/attendance"
        roster={[
          {
            userId: 'student-1',
            firstName: 'علی',
            lastName: 'رضایی',
            status: 'PRESENT',
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'ذخیره حضور و غیاب' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ذخیره ناموفق بود',
    );
  });
});
