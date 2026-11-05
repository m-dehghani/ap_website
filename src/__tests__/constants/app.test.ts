import { describe, expect, it } from 'vitest';
import { NAVIGATION } from '@/constants/app';

describe('site navigation', () => {
  it('derives footer destinations from the main navigation source', () => {
    expect(NAVIGATION.footer.quickLinks.map(({ href }) => href)).toEqual(
      NAVIGATION.main.slice(1).map(({ href }) => href),
    );
    expect(NAVIGATION.footer.quickLinks).toMatchObject([
      { href: '/shop', label: 'فروشگاه' },
      { href: '/programs', label: 'برنامه‌های آموزشی' },
      { href: '/coaches', label: 'مربیان ما' },
      { href: '/about', label: 'درباره آکادمی' },
      { href: '/news', label: 'اخبار و رویدادها' },
      { href: '/testimonials', label: 'نظرات و افتخارات' },
      { href: '/contact', label: 'تماس با ما' },
    ]);
    expect(NAVIGATION.main.map(({ href }) => href)).not.toContain('/success');
    expect(NAVIGATION.footer.programs[0]?.href).toBe(
      NAVIGATION.main.find(({ href }) => href === '/programs')?.href,
    );
  });
});
