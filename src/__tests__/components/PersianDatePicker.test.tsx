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
});
