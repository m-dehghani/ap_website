import { expect, test } from '@playwright/test';

test('admin records attendance for a student enrolled in the session program', async ({
  page,
}) => {
  let submitted: unknown;
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'admin-1', firstName: 'مدیر', lastName: 'آکادمی', role: 'ADMIN' },
      }),
    });
  });
  await page.route('**/api/admin/programs', (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route('**/api/admin/coaches', (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route('**/api/admin/sessions/session-1/attendance', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ attendance: [] }),
    });
  });
  await page.route('**/api/admin/sessions/session-1', (route) =>
    route.fulfill({
      json: {
        id: 'session-1',
        name: 'تمرین پایه',
        description: null,
        date: '2026-10-25T09:00:00.000Z',
        duration: 60,
        location: 'زمین یک',
        maxCapacity: 15,
        status: 'SCHEDULED',
        program: {
          id: 'program-1',
          name: 'آموزش فوتبال',
          registrations: [
            {
              userId: 'student-1',
              user: { firstName: 'علی', lastName: 'رضایی' },
            },
          ],
        },
        coach: { id: 'coach-1', firstName: 'مربی', lastName: 'یک' },
        attendance: [],
      },
    }),
  );

  await page.goto('/admin/sessions/session-1');
  await page.getByRole('combobox').selectOption('LATE');
  await page.getByRole('button', { name: 'ذخیره حضور و غیاب' }).click();

  await expect(page.getByRole('status')).toContainText('وضعیت حضور ثبت شد');
  expect(submitted).toEqual({
    attendance: [{ userId: 'student-1', status: 'LATE' }],
  });
});
