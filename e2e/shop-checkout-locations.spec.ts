import { expect, test } from '@playwright/test';

test('checkout loads shipping provinces and cities from the public API', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'ap-shop-cart',
      JSON.stringify([
        {
          variantId: 'variant-1',
          productSlug: 'training-shirt',
          productName: 'لباس تمرین',
          image: null,
          size: 'M',
          color: 'قرمز',
          price: 250000,
          quantity: 1,
        },
      ]),
    );
  });
  await page.route('**/api/shipping/provinces', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'province-1',
          name: 'تهران',
          nameEn: 'Tehran',
          shippingFee: 50000,
        },
      ]),
    });
  });
  await page.route('**/api/shipping/cities**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'city-1',
          name: 'تهران',
          nameEn: 'Tehran',
          shippingFee: 30000,
        },
      ]),
    });
  });

  await page.goto('/shop/cart');

  const provinceSelect = page.getByLabel('استان');
  await expect(provinceSelect).toContainText('تهران');
  await provinceSelect.selectOption('تهران');
  await expect(page.getByLabel('شهر')).toContainText('تهران');
});
