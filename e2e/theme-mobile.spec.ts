import { expect, test } from '@playwright/test';

const routeGroups = [
  { group: 'public', path: '/' },
  { group: 'authentication', path: '/login' },
  { group: 'student', path: '/student/dashboard', requiresLogin: true },
  { group: 'coach', path: '/coach/dashboard', requiresLogin: true },
  { group: 'admin', path: '/admin', requiresLogin: true },
] as const;

for (const theme of ['light', 'dark'] as const) {
  test(`keeps the ${theme} theme across route groups`, async ({ page }) => {
    await page.addInitScript((preference) => {
      localStorage.setItem('ap-theme-preference', preference);
    }, theme);

    for (const route of routeGroups) {
      await page.goto(route.path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        theme === 'dark' ? 'rgb(22, 15, 18)' : 'rgb(248, 250, 252)',
      );

      if ('requiresLogin' in route && route.requiresLogin) {
        await expect(page).toHaveURL(/\/login(?:\?|$)/);
      }
    }
  });

  test(`keeps the homepage readable at supported widths in ${theme} mode`, async ({
    page,
  }) => {
    await page.addInitScript((preference) => {
      localStorage.setItem('ap-theme-preference', preference);
    }, theme);

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const layout = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        headings: Array.from(document.querySelectorAll('main h1, main h2')).map(
          (heading) => {
            const rect = heading.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          },
        ),
      }));

      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(
        layout.headings.every(
          ({ left, right }) => left >= 0 && right <= width + 1,
        ),
      ).toBe(true);

      if (width < 768) {
        const quickLinks = page.getByRole('navigation', {
          name: 'دسترسی سریع به بخش‌های آکادمی',
        });
        await expect(
          quickLinks.getByRole('link', { name: 'ثبت‌نام', exact: true }),
        ).toBeVisible();
        await expect(
          quickLinks.getByRole('link', { name: 'برنامه‌ها', exact: true }),
        ).toBeVisible();
      }
    }
  });
}

test('theme control applies its accessible selection', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'student-theme-test',
          firstName: 'آزمون',
          lastName: 'پوسته',
          role: 'STUDENT',
        },
      }),
    });
  });

  await page.goto('/settings');
  const control = page.getByRole('group', { name: 'انتخاب پوسته سایت' });
  const nightChoice = control.getByRole('button', { name: 'شب' });

  await expect(nightChoice).toHaveAttribute('aria-pressed', 'false');
  expect(await nightChoice.evaluate((button) => button.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);

  await nightChoice.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(nightChoice).toHaveAttribute('aria-pressed', 'true');
});
