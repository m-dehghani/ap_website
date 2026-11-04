import {
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { formatToman, toPersianDigits } from '@/lib/format';
import type { ProgramViewModel } from '@/types/viewModels/program';

interface ComparisonField {
  key: string;
  label: string;
  icon: typeof TrophyIcon;
}

const comparisonFields: ComparisonField[] = [
  { key: 'name', label: 'نام برنامه', icon: TrophyIcon },
  { key: 'ageRange', label: 'محدوده سنی', icon: UserGroupIcon },
  { key: 'duration', label: 'مدت (ماه)', icon: CalendarDaysIcon },
  { key: 'sessionCount', label: 'تعداد جلسات', icon: ClockIcon },
  { key: 'maxStudents', label: 'حداکثر بازیکن', icon: UserGroupIcon },
  { key: 'level', label: 'سطح', icon: ChartBarIcon },
  { key: 'price', label: 'قیمت', icon: CurrencyDollarIcon },
];

export default function ComparisonTable({
  programs,
  selectedProgram,
}: {
  programs: ProgramViewModel[];
  selectedProgram: number;
}) {
  return (
    <div>
      <div data-testid="mobile-comparison" className="space-y-4 xl:hidden">
        {programs.map((program, index) => (
          <article
            key={program.id}
            className={`rounded-2xl border p-5 ${
              index === selectedProgram
                ? 'border-primary-300 bg-primary-50/70'
                : 'border-slate-200 bg-white'
            }`}
          >
            <h4 className="text-lg font-bold text-slate-900">{program.name}</h4>
            <dl className="mt-3 divide-y divide-slate-200">
              {comparisonFields.slice(1).map((field) => (
                <div
                  key={field.key}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <dt className="text-sm text-slate-600">{field.label}</dt>
                  <dd className="min-w-0 text-left font-semibold text-slate-900">
                    {renderComparisonValue(program, field.key)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <table className="hidden w-full text-right xl:table">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th scope="col" className="p-4 font-bold text-gray-900">
              ویژگی
            </th>
            {programs.map((program, index) => (
              <th
                key={program.id}
                scope="col"
                className={`p-4 text-center font-bold ${
                  index === selectedProgram
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{program.icon}</span>
                  <span>{program.name}</span>
                  {program.popular && (
                    <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs text-white">
                      محبوب
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFields.map((field, rowIndex) => (
            <tr
              key={field.key}
              className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <th scope="row" className="p-4 font-medium text-gray-900">
                <span className="flex items-center gap-2">
                  <field.icon className="h-5 w-5 text-gray-400" />
                  {field.label}
                </span>
              </th>
              {programs.map((program, colIndex) => (
                <td
                  key={program.id}
                  className={`p-4 text-center ${
                    colIndex === selectedProgram ? 'bg-primary-50' : ''
                  }`}
                >
                  {field.key === 'name' ? (
                    <span className="font-bold text-gray-900">{program.name}</span>
                  ) : (
                    renderComparisonValue(program, field.key)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderComparisonValue(program: ProgramViewModel, fieldKey: string) {
  switch (fieldKey) {
    case 'ageRange':
      return <span className="text-gray-700">{program.ageRange}</span>;
    case 'duration':
      return (
        <span className="persian-numbers tabular-nums text-gray-700">
          {program.duration} ماه
        </span>
      );
    case 'sessionCount':
      return (
        <span className="persian-numbers tabular-nums text-gray-700">
          {toPersianDigits(program.sessionCount)} جلسه
        </span>
      );
    case 'maxStudents':
      return (
        <span className="persian-numbers tabular-nums text-gray-700">
          {toPersianDigits(program.maxStudents)} نفر
        </span>
      );
    case 'level':
      return (
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            program.level === 'مبتدی'
              ? 'bg-green-100 text-green-700'
              : program.level === 'متوسط'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {program.level}
        </span>
      );
    case 'price':
      return (
        <span className="persian-numbers tabular-nums font-bold text-primary-600">
          {formatToman(program.price)}
        </span>
      );
    default:
      return null;
  }
}
