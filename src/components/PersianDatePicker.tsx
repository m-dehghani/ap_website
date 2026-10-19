import React from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

interface PersianDatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  autoComplete?: string;
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  id,
  value,
  onChange,
  className,
  required,
  ariaInvalid,
  ariaDescribedBy,
  autoComplete,
}) => {
  return (
    <DatePicker
      id={id}
      calendar={persian}
      locale={persian_fa}
      digits={persianDigits}
      format="YYYY/MM/DD"
      value={value}
      maxDate={new Date()}
      calendarPosition="bottom-right"
      inputMode="numeric"
      placeholder="مثلاً ۱۳۹۰/۰۲/۱۵"
      required={required}
      inputClass={className}
      onChange={(date, options) => {
        if (date instanceof DateObject) {
          onChange(date.format('YYYY/MM/DD'));
        } else if (options.isTyping && !options.validatedValue) {
          onChange('');
        }
      }}
      render={(inputValue, openCalendar, handleValueChange) => (
        <div className="relative">
          <input
            id={id}
            type="text"
            dir="ltr"
            lang="fa-IR"
            inputMode="numeric"
            placeholder="مثلاً ۱۳۹۰/۰۲/۱۵"
            autoComplete={autoComplete}
            required={required}
            value={inputValue}
            onChange={handleValueChange}
            onFocus={openCalendar}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={className}
          />
          <button
            type="button"
            onClick={openCalendar}
            aria-label="باز کردن تقویم شمسی"
            className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-primary-600"
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    />
  );
};

export default PersianDatePicker;
