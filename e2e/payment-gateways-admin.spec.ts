import { expect, test } from '@playwright/test';

test('admin gateway settings keep Pasargad informational and non-configurable', async ({
  page,
}) => {
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      json: {
        user: {
          id: 'phase18-admin',
          firstName: 'مدیر',
          lastName: 'آکادمی',
          role: 'ADMIN',
        },
      },
    }),
  );
  await page.route('**/api/admin/payment-gateways', (route) =>
    route.fulfill({
      json: {
        keyReady: true,
        defaultProvider: 'ZARINPAL',
        providers: [
          {
            provider: 'ZARINPAL',
            enabled: true,
            configured: true,
            isDefault: true,
            state: 'available',
            credentialSource: 'environment',
          },
          {
            provider: 'ZIBAL',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'configurable',
            credentialSource: 'none',
          },
          {
            provider: 'PASARGAD',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'deferred',
            credentialSource: 'none',
          },
        ],
      },
    }),
  );

  await page.goto('/admin/payment-gateways');

  await expect(
    page.getByRole('heading', { name: 'درگاه‌های پرداخت' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'فعال‌سازی درگاه زیبال' }),
  ).toBeVisible();
  const pasargad = page.getByRole('region', { name: 'درگاه پاسارگاد' });
  await expect(pasargad).toContainText('در انتظار تأیید مستندات رسمی');
  await expect(pasargad.locator('input, button, select')).toHaveCount(0);
});
