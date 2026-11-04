import { expect, test } from '@playwright/test';

const pages = [
  {
    path: '/about',
    heading: /درباره/,
    purpose: 'تاریخچه آکادمی',
    metadata: /درباره ما/,
  },
  {
    path: '/success',
    heading: /افتخارات و دستاوردهای آکادمی/,
    purpose: 'افتخارات آکادمی',
    metadata: /افتخارات آکادمی/,
  },
  {
    path: '/testimonials',
    heading: /نظرات و تجربه‌ها/,
    purpose: 'نظرات و تجربه‌ها',
    metadata: /نظرات و تجربه‌ها/,
  },
] as const;

for (const theme of ['light', 'dark'] as const) {
  test(`academy pages preserve purpose and fit tested widths in ${theme} theme`, async ({
    page,
  }) => {
    await page.addInitScript((preference) => {
      localStorage.setItem('ap-theme-preference', preference);
    }, theme);

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of pages) {
        await page.goto(route.path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
        await expect(page.locator('main')).toContainText(route.purpose);
        await expect(page).toHaveTitle(route.metadata);

        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          headings: Array.from(document.querySelectorAll('main h1, main h2')).map(
            (heading) => {
              const rect = heading.getBoundingClientRect();
              return { left: rect.left, right: rect.right };
            },
          ),
        }));
        expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
        expect(
          dimensions.headings.every(
            ({ left, right }) => left >= 0 && right <= width + 1,
          ),
        ).toBe(true);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          new RegExp(`${route.path}$`),
        );
      }
    }

    await page.goto('/success');
    await expect(page.locator('main')).not.toContainText('نظرات و تجربه‌ها');
    await expect(page.locator('main')).not.toContainText('بازیکنان');
    await expect(
      page
        .getByRole('navigation', { name: 'منوی اصلی' })
        .getByRole('link', { name: 'نظرات و تجربه‌ها', exact: true }),
    ).toBeVisible();
  });
}
