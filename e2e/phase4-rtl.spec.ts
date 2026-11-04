import { expect, test } from '@playwright/test';

test('homepage retains RTL semantics and 44px hero touch targets', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'fa-IR');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const controls = page
    .getByRole('group', { name: 'اسلایدهای هیرو' })
    .getByRole('button');
  await expect(controls.first()).toBeVisible();
  const targetSizes = await controls.evaluateAll((buttons) =>
    buttons.map((button) => {
      const { width, height } = button.getBoundingClientRect();
      return { width, height };
    }),
  );

  expect(targetSizes.length).toBeGreaterThan(0);
  expect(
    targetSizes.every(({ width, height }) => width >= 44 && height >= 44),
  ).toBe(true);
});
