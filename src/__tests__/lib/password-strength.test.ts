import { describe, expect, it } from 'vitest';
import { getPasswordStrength } from '@/lib/password-strength';

describe('getPasswordStrength', () => {
  it('does not call an empty or too-short password strong', () => {
    expect(getPasswordStrength('')).toEqual({ score: 0, label: 'وارد نشده' });
    expect(getPasswordStrength('abc123')).toEqual({
      score: 1,
      label: 'ضعیف',
    });
  });

  it('recognizes length and character variety without changing password rules', () => {
    expect(getPasswordStrength('abcdefghijab')).toEqual({
      score: 2,
      label: 'متوسط',
    });
    expect(getPasswordStrength('پاسورد۱۲۳۴۵۶۷۸!')).toEqual({
      score: 4,
      label: 'قوی',
    });
  });
});
