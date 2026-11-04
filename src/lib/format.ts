const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export type AppCurrency = 'TOMAN' | 'IRR' | (string & {});

export function formatNumber(
  value: number,
  locale = 'fa-IR',
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDate(
  value: string | Date | null | undefined,
  locale = 'fa-IR',
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Tehran',
    ...(Object.keys(options).length === 0
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : {}),
    ...options,
  }).format(date);
}

export function formatCurrency(
  amount: number,
  currency: AppCurrency = 'TOMAN',
  locale = 'fa-IR',
): string {
  if (currency === 'TOMAN') {
    return `${formatNumber(amount, locale)} ${locale.startsWith('fa') ? 'تومان' : 'Toman'}`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function toPersianDigits(value: string | number): string {
  if (typeof value === 'number') {
    return formatNumber(value, 'fa-IR', { useGrouping: false });
  }
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatToman(amount: number): string {
  return formatCurrency(amount, 'TOMAN');
}

export function formatPersianDate(
  iso: string | null | undefined,
): string {
  return formatDate(iso);
}

// Turns "021-12345678" into "+982112345678" for tel: links.
export function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:${digits.startsWith('0') ? `+98${digits.slice(1)}` : digits}`;
}
