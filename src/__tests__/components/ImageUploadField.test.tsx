import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImageUploadField from '@/components/ImageUploadField';

describe('ImageUploadField', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: '/api/uploads/550e8400-e29b-41d4-a716-446655440000' }),
      }),
    );
  });

  it('uploads the selected file as raw bytes and exposes the stored image reference', async () => {
    const onChange = vi.fn();
    render(
      <ImageUploadField
        label="تصویر نظر"
        scope="testimonial"
        value=""
        onChange={onChange}
      />,
    );
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'test.png', {
      type: 'image/png',
    });

    fireEvent.change(screen.getByLabelText('تصویر نظر'), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/uploads?scope=testimonial',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'image/png' },
          body: file,
        }),
      );
      expect(onChange).toHaveBeenCalledWith(
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000',
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'تصویر با موفقیت بارگذاری شد',
      );
      expect(screen.getByRole('status')).toHaveClass('text-sm text-green-700');
    });
  });

  it('shows a Persian error and does not send an unsupported file', async () => {
    const onChange = vi.fn();
    render(
      <ImageUploadField
        label="تصویر نظر"
        scope="testimonial"
        value=""
        onChange={onChange}
      />,
    );
    const file = new File(['not an image'], 'payload.svg', {
      type: 'image/svg+xml',
    });

    fireEvent.change(screen.getByLabelText('تصویر نظر'), {
      target: { files: [file] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'فقط تصویر JPEG، PNG یا WebP تا حجم ۵ مگابایت پذیرفته می‌شود',
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
