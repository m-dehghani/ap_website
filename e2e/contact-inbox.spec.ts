import { expect, test } from '@playwright/test';

test('visitor submits the Persian contact form through the public API', async ({
  page,
}) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/contact', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'پیام شما با موفقیت ثبت شد.' }),
    });
  });

  await page.goto('/contact');
  await page.getByLabel('نام', { exact: true }).fill('علی');
  await page.getByLabel('نام خانوادگی').fill('محمدی');
  await page.getByLabel('ایمیل').fill('ali@example.com');
  await page.getByLabel('پیام').fill('درباره ثبت نام پرسشی دارم.');
  await page.getByRole('button', { name: 'ارسال پیام' }).click();

  await expect(page.getByRole('status')).toContainText('با موفقیت ثبت شد');
  expect(submitted).toMatchObject({
    firstName: 'علی',
    lastName: 'محمدی',
    email: 'ali@example.com',
  });
});

test('admin reviews a contact message and changes its status', async ({
  page,
}) => {
  let messageStatus = 'NEW';
  let patch: unknown;
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'admin-1', firstName: 'مدیر', lastName: 'آکادمی', role: 'ADMIN' },
      }),
    });
  });
  await page.route('**/api/admin/messages', async (route) => {
    if (route.request().method() === 'PATCH') {
      patch = route.request().postDataJSON();
      messageStatus = String((patch as { status: string }).status);
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        route.request().method() === 'PATCH'
          ? { message: 'Updated' }
          : {
              data: [
                {
                  id: 'message-1',
                  firstName: 'علی',
                  lastName: 'محمدی',
                  email: 'ali@example.com',
                  phone: null,
                  message: 'درباره ثبت نام پرسشی دارم.',
                  status: messageStatus,
                  createdAt: '2026-10-01T10:00:00.000Z',
                },
              ],
            },
      ),
    });
  });

  await page.goto('/admin/messages');
  await expect(page.getByText('درباره ثبت نام پرسشی دارم.')).toBeVisible();
  await page.getByRole('combobox', { name: 'وضعیت پیام علی محمدی' }).selectOption('READ');
  await expect(page.getByRole('status')).toContainText('به‌روزرسانی شد');
  expect(patch).toEqual({
    id: 'message-1',
    status: 'READ',
    expectedStatus: 'NEW',
  });
});
