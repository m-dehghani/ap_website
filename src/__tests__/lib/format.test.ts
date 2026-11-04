import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPersianDate,
  formatToman,
  toPersianDigits,
} from '@/lib/format';

describe('locale-aware formatting', () => {
  it('formats numbers using the requested locale without changing digit-only output', () => {
    expect(formatNumber(12345.6, 'en-US')).toBe('12,345.6');
    expect(formatNumber(12345.6, 'fa-IR')).toContain('۱۲');
    expect(toPersianDigits('001/12')).toBe('۰۰۱/۱۲');
  });

  it('formats Persian dates in Tehran time and supports a Gregorian locale', () => {
    expect(formatDate('2026-03-20T12:00:00.000Z', 'en-US')).toBe('03/20/2026');
    expect(formatPersianDate('not-a-date')).toBe('');
    expect(formatPersianDate(null)).toBe('');
    expect(formatPersianDate('2026-03-20T12:00:00.000Z')).not.toBe('');
  });

  it('preserves the academy Toman unit and formats explicit ISO currency values', () => {
    expect(formatToman(12500)).toBe(`${new Intl.NumberFormat('fa-IR').format(12500)} تومان`);
    expect(formatCurrency(12500, 'TOMAN')).toBe(formatToman(12500));
    expect(formatCurrency(12500, 'USD', 'en-US')).toBe(
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(12500),
    );
    expect(formatCurrency(125000, 'IRR', 'en-US')).toBe(
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IRR' }).format(125000),
    );
  });
});
