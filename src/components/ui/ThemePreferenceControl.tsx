import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { useThemeSelection } from '@/hooks/useThemePreference';
import type { ThemePreference } from '@/hooks/useThemePreference';

const choices: {
  value: ThemePreference;
  label: string;
  Icon: typeof SunIcon;
}[] = [
  { value: 'light', label: 'روز', Icon: SunIcon },
  { value: 'dark', label: 'شب', Icon: MoonIcon },
  { value: 'system', label: 'سیستم', Icon: ComputerDesktopIcon },
];

export default function ThemePreferenceControl({
  onSelection,
}: {
  onSelection?: () => void;
}) {
  const { preference, selectThemePreference, saving } = useThemeSelection();

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark-theme-control dark:bg-navy-800"
      role="group"
      aria-label="انتخاب پوسته سایت"
    >
      {choices.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={(event) => {
            const details = event.currentTarget.closest('details');
            if (details) details.open = false;
            onSelection?.();
            void selectThemePreference(value);
          }}
          disabled={saving}
          aria-pressed={preference === value}
          className={`flex min-h-11 items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-70 sm:text-sm ${
            preference === value
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-slate-600 hover:bg-white/70 hover:text-primary-700'
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
