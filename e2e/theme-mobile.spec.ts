import { expect, test } from '@playwright/test';

const routeGroups = [
  { group: 'public', path: '/' },
  { group: 'about', path: '/about' },
  { group: 'programs', path: '/programs' },
  { group: 'coaches', path: '/coaches' },
  { group: 'news', path: '/news' },
  { group: 'testimonials', path: '/testimonials' },
  { group: 'shop', path: '/shop' },
  { group: 'contact', path: '/contact' },
  { group: 'legal', path: '/privacy' },
  { group: 'legal', path: '/terms' },
  { group: 'legal', path: '/cookies' },
  { group: 'registration', path: '/register' },
  { group: 'registration', path: '/success' },
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
      await expect(page.locator('html')).toHaveCSS('color-scheme', theme);
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
          quickLinks.getByRole('link', { name: /ثبت‌نام/ }),
        ).toBeVisible();
        await expect(
          quickLinks.getByRole('link', { name: /برنامه‌ها/ }),
        ).toBeVisible();
      }
    }
  });
}

test('theme control applies its accessible selection', async ({ page }) => {
  let savedPreference: unknown;
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
          themePreference: 'light',
        },
      }),
    });
  });
  await page.route('**/api/preferences/theme', async (route) => {
    savedPreference = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ themePreference: 'dark' }),
    });
  });

  await page.goto('/settings');
  const control = page.getByRole('group', { name: 'انتخاب پوسته سایت' });
  const nightChoice = control.getByRole('button', { name: 'شب' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(nightChoice).toHaveAttribute('aria-pressed', 'false');
  expect(await nightChoice.evaluate((button) => button.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);

  await nightChoice.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(nightChoice).toHaveAttribute('aria-pressed', 'true');
  expect(savedPreference).toEqual({ themePreference: 'dark' });
});

test('guests can open the desktop theme picker', async ({ page }) => {
  await page.goto('/programs');
  const picker = page.locator('summary[aria-label="انتخاب پوسته سایت"]');
  await expect(picker).toBeVisible();
  await picker.click();

  const preferenceControl = page.getByRole('group', {
    name: 'انتخاب پوسته سایت',
  });
  await preferenceControl.getByRole('button', { name: 'شب' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('guests can select a theme and keep it across visits', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('theme-test-initialized')) {
      localStorage.removeItem('ap-theme-preference');
      sessionStorage.setItem('theme-test-initialized', 'true');
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/coaches');
  await page.getByRole('button', { name: 'باز کردن منوی اصلی' }).click();

  const preferenceControl = page.getByRole('group', {
    name: 'انتخاب پوسته سایت',
  });
  await preferenceControl.getByRole('button', { name: 'شب' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('main [class*="from-slate-50"]')).toHaveCSS(
    'background-image',
    /rgb\(36, 25, 29\).*rgb\(22, 15, 18\)/,
  );

  await page.goto('/programs');
  await expect(page.locator('main .from-primary-50.to-primary-100')).toHaveCSS(
    'background-image',
    /rgb\(63, 32, 40\).*rgb\(48, 33, 38\)/,
  );

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
