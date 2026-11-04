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
          image: '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
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
  await expect(
    page
      .getByRole('button', { name: 'باز کردن منوی حساب کاربری' })
      .locator('img'),
  ).toHaveAttribute(
    'src',
    /\/api\/uploads\/550e8400-e29b-41d4-a716-446655440000\.png$/,
  );
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
  const pickerDetails = page.locator('details').filter({ has: picker });
  await expect(pickerDetails).toHaveAttribute('open', '');

  const preferenceControl = page.getByRole('group', {
    name: 'انتخاب پوسته سایت',
  });
  await preferenceControl.getByRole('button', { name: 'شب' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(pickerDetails).not.toHaveAttribute('open', '');
});

test('desktop navigation hover text stays readable in night theme', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('ap-theme-preference', 'dark');
  });
  await page.goto('/about');

  const aboutLink = page.locator(
    '.site-header nav[aria-label="منوی اصلی"] a[href="/about"]',
  );
  await aboutLink.hover();

  await expect(aboutLink).toHaveCSS('color', 'rgb(255, 241, 243)');
  await expect(aboutLink).toHaveCSS('background-color', 'rgb(59, 37, 43)');
});

test('coach portraits reveal color on hover without rotating', async ({
  page,
}) => {
  await page.goto('/coaches');

  const card = page.locator('.coach-card').first();
  const portrait = card.locator('.coach-portrait');
  const image = portrait.locator('img');

  await expect(portrait).toHaveCSS('scale', '1');
  if (await image.count()) {
    await expect(image).toHaveCSS('filter', 'grayscale(1)');
  }

  await card.hover();
  await expect(portrait).toHaveCSS('scale', '1.06');
  await expect(portrait).toHaveCSS('rotate', 'none');
  if (await image.count()) {
    await expect(image).toHaveCSS('filter', 'grayscale(0)');
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(portrait).toHaveCSS('scale', '1');
});

test('navy badges remain readable in night theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ap-theme-preference', 'dark');
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const badge = page.locator('.bg-navy-100').first();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveCSS('background-color', 'rgb(22, 15, 18)');
  await expect(badge).toHaveCSS('color', 'rgb(255, 241, 243)');
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
  await expect(page.locator('#mobile-navigation')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'باز کردن منوی اصلی' }),
  ).toHaveAttribute('aria-expanded', 'false');
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

test('mobile route changes land at the top without smooth-scroll oscillation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/contact');
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });

  await page.getByRole('button', { name: 'باز کردن منوی اصلی' }).click();
  await page.locator('#mobile-navigation a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('contact layout stays within the viewport at mobile and desktop widths', async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/contact');

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(
      dimensions.viewportWidth,
    );
    await expect(page.getByRole('heading', { name: 'تماس با ما' })).toBeVisible();
  }
});

test('shop price filter remains readable in night theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ap-theme-preference', 'dark');
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/shop');

  const filter = page.locator('.shop-price-filter');
  await expect(filter).toHaveCSS('background-color', 'rgb(63, 32, 40)');
  await expect(filter.locator('legend')).toHaveCSS(
    'color',
    'rgb(255, 241, 243)',
  );
  await expect(filter.locator('output').first()).toHaveCSS(
    'color',
    'rgb(254, 205, 211)',
  );
});

test('homepage CTA heading is legible on its light surface', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ap-theme-preference', 'light');
  });
  await page.goto('/');

  await expect(
    page
      .locator('.home-page h3.text-gray-900')
      .filter({ hasText: 'آماده شروع سفر فوتبال خود هستید؟' }),
  ).toHaveCSS('color', 'oklch(0.21 0.034 264.665)');
});

test('program details keep the popular badge and stat values inside their cards', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('ap-theme-preference', 'dark');
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/programs');

  const details = page
    .locator('main .card-glass')
    .filter({ hasText: 'مجموع جلسات' })
    .first();
  await expect(details).toBeVisible();

  const badge = details.getByText('محبوب‌ترین');
  if ((await badge.count()) > 0) {
    const [badgeRect, titleRect] = await Promise.all([
      badge.boundingBox(),
      details.locator('h3').first().boundingBox(),
    ]);
    expect(badgeRect).not.toBeNull();
    expect(titleRect).not.toBeNull();
    expect(badgeRect!.y + badgeRect!.height).toBeLessThanOrEqual(titleRect!.y);
  }

  const statValues = await page.locator('.program-stat-value').evaluateAll(
    (elements) =>
      elements.map((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
  );
  expect(statValues.length).toBeGreaterThan(0);
  expect(
    statValues.every(({ clientWidth, scrollWidth }) => scrollWidth <= clientWidth + 1),
  ).toBe(true);
});
