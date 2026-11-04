import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PersianDatePicker from '@/components/PersianDatePicker';

describe('PersianDatePicker', () => {
  it('shows the selected Persian date and updates it from the calendar', async () => {
    const onChange = vi.fn();

    render(
      <PersianDatePicker
        id="birth-date"
        value="۱۳۹۰/۰۲/۱۵"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('۱۳۹۰/۰۲/۱۵');
    fireEvent.click(screen.getByRole('button', { name: 'باز کردن تقویم شمسی' }));
    fireEvent.click(await screen.findByText('۱۶'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('۱۳۹۰/۰۲/۱۶');
    });
  });

  it('exposes an accessible name, validation hint, and expanded calendar state', async () => {
    render(
      <label htmlFor="birth-date">
        تاریخ تولد
        <PersianDatePicker
          id="birth-date"
          value=""
          onChange={vi.fn()}
          ariaInvalid
          ariaDescribedBy="birth-date-error"
        />
      </label>,
    );

    expect(screen.getByRole('textbox', { name: 'تاریخ تولد' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'birth-date-error',
    );

    const openButton = screen.getByRole('button', {
      name: 'باز کردن تقویم شمسی',
    });
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(openButton);
    await waitFor(() => expect(openButton).toHaveAttribute('aria-expanded', 'true'));
  });
});
