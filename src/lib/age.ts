const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const persianCalendarFormatter = new Intl.DateTimeFormat(
  'en-US-u-ca-persian-nu-latn',
  {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  },
);

export function parseBirthDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();
  const endOfToday = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getTime() > endOfToday
  ) {
    return null;
  }
  return date;
}

export function parsePersianBirthDate(value: string): Date | null {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .trim();
  const match = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const approximateNewYear = Date.UTC(year + 621, 2, 20);
  let newYear: number | null = null;
  for (let offset = -4; offset <= 4; offset += 1) {
    const candidate = approximateNewYear + offset * DAY_IN_MILLISECONDS;
    const parts = persianCalendarFormatter.formatToParts(candidate);
    const calendarDate = Object.fromEntries(
      parts
        .filter(({ type }) => ['year', 'month', 'day'].includes(type))
        .map(({ type, value }) => [type, Number(value)]),
    );
    if (
      calendarDate.year === year &&
      calendarDate.month === 1 &&
      calendarDate.day === 1
    ) {
      newYear = candidate;
      break;
    }
  }
  if (newYear === null) return null;

  const dayOfYear =
    (month <= 6 ? (month - 1) * 31 : 186 + (month - 7) * 30) + day - 1;
  const date = new Date(newYear + dayOfYear * DAY_IN_MILLISECONDS);
  const parts = persianCalendarFormatter.formatToParts(date);
  const calendarDate = Object.fromEntries(
    parts
      .filter(({ type }) => ['year', 'month', 'day'].includes(type))
      .map(({ type, value }) => [type, Number(value)]),
  );
  if (
    calendarDate.year !== year ||
    calendarDate.month !== month ||
    calendarDate.day !== day
  ) {
    return null;
  }

  const gregorianDate = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
  return parseBirthDate(gregorianDate);
}

export function parseBirthDateInput(value: string): Date | null {
  return parseBirthDate(value) ?? parsePersianBirthDate(value);
}

export function calculateAge(birthDate: Date, onDate = new Date()): number {
  let age = onDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDifference = onDate.getUTCMonth() - birthDate.getUTCMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && onDate.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}
