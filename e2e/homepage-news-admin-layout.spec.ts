import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { getPrisma } from '../src/lib/db';

const { loadEnvConfig } = createRequire(import.meta.url)(
  '@next/env',
) as typeof import('@next/env');
loadEnvConfig(process.cwd());

const adminPagesRoot = path.join(process.cwd(), 'src', 'pages', 'admin');
const pagesRoot = path.join(process.cwd(), 'src', 'pages');

function findPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findPageFiles(entryPath);
    return entry.name.endsWith('.tsx') && !entryPath.includes(`${path.sep}api${path.sep}`)
      ? [entryPath]
      : [];
  });
}

function routeForPageFile(filePath: string): string {
  const relativePath = path.relative(pagesRoot, filePath).split(path.sep).join('/');
  const withoutExtension = relativePath.replace(/\.tsx$/, '').replace(/\/index$/, '');
  return `/${withoutExtension}`.replace(/\[\.\.\.(.+?)\]/g, 'phase19-test-value').replace(
    /\[(.+?)\]/g,
    (_match, parameter: string) =>
      parameter === 'page'
        ? 'about'
        : parameter === 'section'
          ? 'history'
          : 'phase19-test-id',
  );
}

const adminRoutes = findPageFiles(adminPagesRoot)
  .map(routeForPageFile)
  .sort((left, right) => left.localeCompare(right));

const clientAuthenticatedRoutes = adminRoutes.filter(
  (route) => route !== '/admin',
);

test('homepage product, news, and navigation fit narrow viewports', async ({
  page,
}) => {
  const prisma = await getPrisma();
  const article = await prisma.newsArticle.create({
    data: {
      title: 'خبر آزمایشی صفحه نخست',
      excerpt: 'خلاصه خبر آزمایشی',
      content: 'متن خبر آزمایشی',
      category: 'matches',
      author: 'مدیر آکادمی',
      isPublished: true,
      publishedAt: new Date(),
    },
    select: { id: true },
  });

  await page.route('**/api/shop/products**', (route) =>
    route.fulfill({
      json: {
        products: [
          {
            id: 'product-1',
            slug: 'existing-product',
            name: 'محصول موجود',
            category: 'تجهیزات',
            shortDescription: 'توضیح موجود',
            images: [],
            price: 250000,
            displayPrice: 250000,
            regularPrice: 250000,
            isComingSoon: false,
            availableAt: null,
            availableStock: 2,
            averageRating: 0,
            reviewCount: 0,
          },
        ],
      },
    }),
  );

  try {
    for (const width of [320, 390, 1024, 1028, 1280, 1536]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'برای بازی، آماده شو' }),
      ).toBeVisible();
      await expect(page.getByRole('heading', { name: 'آخرین اخبار' })).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'مشاهده محصول موجود' }),
      ).toHaveAttribute('href', '/shop/existing-product');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
        `homepage overflows at ${width}px`,
      ).toBe(true);

      const mainNavigation = page.getByRole('navigation', { name: 'منوی اصلی' });
      if (width >= 1536) {
        await expect(mainNavigation).toBeVisible();
        expect(
          await mainNavigation.evaluate(
            (navigation) => navigation.scrollWidth <= navigation.clientWidth,
          ),
          `main navigation overflows at ${width}px`,
        ).toBe(true);
        expect(
          await mainNavigation.locator('a').evaluateAll((links) => {
            const tops = links.map((link) => link.getBoundingClientRect().top);
            return tops.every((top) => Math.abs(top - tops[0]) < 1);
          }),
          `main navigation wraps at ${width}px`,
        ).toBe(true);
        await expect(mainNavigation.locator('a svg')).toHaveCount(8);
      } else {
        await expect(mainNavigation).toBeHidden();
        await expect(
          page.getByRole('button', { name: 'باز کردن منوی اصلی' }),
        ).toBeVisible();
      }

      if (width >= 1024) {
        const heroNewsLink = page.locator('.home-hero a[href^="/news/"]');
        await expect(heroNewsLink).toBeVisible();
        await expect(heroNewsLink).toHaveAttribute(
          'href',
          `/news/${article.id}`,
        );
      }

      const newsLinks = page.locator('a[href^="/news/"]:visible');
      for (const link of await newsLinks.all()) {
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', /^\/news\/[^/]+$/);
      }

      if (width >= 1024 && width <= 1028) {
        await page.locator('.home-hero a[href^="/news/"]').click();
        await expect(page).toHaveURL(`/news/${article.id}`);
        await expect(page.locator('article h1')).toBeVisible();
      }
    }
  } finally {
    await prisma.newsArticle.delete({ where: { id: article.id } });
  }
});

for (const route of clientAuthenticatedRoutes) {
  test(`authenticated AdminLayout is complete on ${route}`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Full route inventory runs in Chromium');
    await page.route('**/api/auth/me', (request) =>
      request.fulfill({
        json: {
          user: {
            id: 'phase19-admin',
            firstName: 'مدیر',
            lastName: 'آکادمی',
            role: 'ADMIN',
          },
        },
      }),
    );

    await page.goto(route);

    const sidebar = page
      .locator('aside')
      .filter({ has: page.getByRole('navigation', { name: 'پنل مدیریت' }) });
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'پنل مدیریت' })).toBeVisible();
  });
}

test('unauthenticated admin visits follow the existing login redirect', async ({
  page,
}) => {
  await page.route('**/api/auth/me', (request) =>
    request.fulfill({ status: 401, json: { user: null } }),
  );

  for (const route of ['/admin', '/admin/content']) {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(
      page.getByRole('navigation', { name: 'پنل مدیریت' }),
    ).toHaveCount(0);
  }
});

test('shop managers retain their shop shell and cannot open admin-only routes', async ({
  page,
}) => {
  await page.route('**/api/auth/me', (request) =>
    request.fulfill({
      json: {
        user: {
          id: 'phase19-shop-manager',
          firstName: 'مدیر',
          lastName: 'فروشگاه',
          role: 'SHOP_MANAGER',
        },
      },
    }),
  );

  await page.goto('/admin/shop');

  await expect(
    page
      .locator('aside')
      .filter({ has: page.getByRole('navigation', { name: 'مدیریت فروشگاه' }) }),
  ).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'مدیریت فروشگاه' }),
  ).toBeVisible();

  await page.goto('/admin/students');
  await expect(page).toHaveURL('/admin/shop');
});

test('missing news articles return a real not-found response', async ({
  page,
}) => {
  const response = await page.goto('/news/phase19-missing-article');

  expect(response?.status()).toBe(404);
  await expect(page.getByText('phase19-missing-article')).toHaveCount(0);
});
