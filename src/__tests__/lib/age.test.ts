import { describe, expect, it } from 'vitest';
import {
  calculateAge,
  parseBirthDate,
  parsePersianBirthDate,
} from '@/lib/age';
import { formatPersianDate } from '@/lib/format';

describe('student age helpers', () => {
  it('rejects invalid and future birth dates', () => {
    expect(parseBirthDate('2012-02-30')).toBeNull();
    expect(parseBirthDate('not-a-date')).toBeNull();
    expect(parseBirthDate('2999-01-01')).toBeNull();
  });

  it('calculates age at the exact birthday boundary', () => {
    const birthDate = parseBirthDate('2010-06-15');
    if (!birthDate) throw new Error('Expected valid birth date');
    expect(calculateAge(birthDate, new Date('2025-06-14T12:00:00.000Z'))).toBe(
      14,
    );
    expect(calculateAge(birthDate, new Date('2025-06-15T00:00:00.000Z'))).toBe(
      15,
    );
  });

  it('parses Persian calendar dates written with Persian or Arabic digits', () => {
    for (const value of ['۱۳۹۰/۰۲/۱۵', '١٣٩٠-٠٢-١٥']) {
      const birthDate = parsePersianBirthDate(value);
      expect(birthDate).not.toBeNull();
      expect(formatPersianDate(birthDate?.toISOString())).toBe('۱۳۹۰/۰۲/۱۵');
    }
  });

  it('rejects invalid and future Persian calendar dates', () => {
    expect(parsePersianBirthDate('۱۴۰۲/۱۳/۰۱')).toBeNull();
    expect(parsePersianBirthDate('۱۴۰۲/۱۲/۳۰')).toBeNull();
    expect(parsePersianBirthDate('۱۴۰۶/۰۱/۰۱')).toBeNull();
  });
});
