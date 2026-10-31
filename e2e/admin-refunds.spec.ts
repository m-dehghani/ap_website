import { expect, test } from '@playwright/test';

const payment = {
  id: 'payment-e2e',
  type: 'payment',
  customerName: 'علی محمدی',
  phone: '09120000000',
  description: 'نوجوانان',
  reference: 'payment-reference',
  amount: 50000,
  currency: 'IRR',
  method: 'ONLINE',
  createdAt: '2026-10-01T10:00:00.000Z',
};

test('admin can record a staff-handled refund from the queue', async ({
  page,
}) => {
  let patchRequest: unknown;
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'admin-1', firstName: 'مدیر', lastName: 'آکادمی', role: 'ADMIN' },
      }),
    });
  });
  await page.route('**/api/admin/refunds', async (route) => {
    if (route.request().method() === 'PATCH') {
      patchRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Recorded' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [payment] }),
    });
  });

  await page.goto('/admin/refunds');
  await expect(page.getByRole('heading', { name: 'صف بازپرداخت' })).toBeVisible();
  await expect(page.getByText('علی محمدی')).toBeVisible();
  await expect(page.getByText('۵٬۰۰۰ تومان')).toBeVisible();
  await page.getByRole('button', { name: 'ثبت انجام بازپرداخت' }).click();

  await expect(
    page.getByText('بازپرداخت خارج از سامانه انجام و ثبت شد.'),
  ).toBeVisible();
  await expect(page.getByText('موردی در صف بازپرداخت نیست.')).toBeVisible();
  expect(patchRequest).toEqual({ type: 'payment', id: 'payment-e2e' });
});
