export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const unicodeLetter = /\p{L}/u;
const unicodeNumber = /\p{N}/u;
const nonAlphanumeric = /[^\p{L}\p{N}]/u;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: 'وارد نشده' };
  if (password.length < 12) return { score: 1, label: 'ضعیف' };

  const varietyCount = [
    unicodeLetter.test(password),
    unicodeNumber.test(password),
    nonAlphanumeric.test(password),
  ].filter(Boolean).length;
  const score = Math.min(
    4,
    2 +
      Number(password.length >= 16) +
      Number(varietyCount >= 2) +
      Number(password.length >= 15 && varietyCount === 3),
  ) as PasswordStrength['score'];

  return {
    score,
    label: ['وارد نشده', 'ضعیف', 'متوسط', 'خوب', 'قوی'][score],
  };
}
