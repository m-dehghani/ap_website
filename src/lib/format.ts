const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatToman(amount: number): string {
  return `${amount.toLocaleString('fa-IR')} تومان`;
}

// Fixed time zone so server and client render the same Solar Hijri date.
const persianDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Tehran',
});

export function formatPersianDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : persianDateFormatter.format(date);
}

// Turns "021-12345678" into "+982112345678" for tel: links.
export function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:${digits.startsWith('0') ? `+98${digits.slice(1)}` : digits}`;
}
