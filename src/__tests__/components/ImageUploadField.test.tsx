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
        json: async () => ({ url: '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png' }),
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
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'تصویر با موفقیت بارگذاری شد',
      );
      expect(screen.getByRole('status')).toHaveClass('text-sm text-green-700');
    });
  });

  it('accepts staff-member photo uploads for the staff form', async () => {
    const onChange = vi.fn();
    render(
      <ImageUploadField
        label="تصویر عضو تیم"
        scope="staff-member"
        value=""
        onChange={onChange}
      />,
    );
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
      'staff.png',
      { type: 'image/png' },
    );

    fireEvent.change(screen.getByLabelText('تصویر عضو تیم'), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/uploads?scope=staff-member',
        expect.objectContaining({ method: 'POST', body: file }),
      );
      expect(onChange).toHaveBeenCalledWith(
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
      );
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

  it('saves a profile image only after the user confirms it', async () => {
    const onChange = vi.fn();
    render(
      <ImageUploadField
        label="تصویر پروفایل"
        scope="profile"
        value=""
        onChange={onChange}
        removable={false}
      />,
    );
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'test.png', {
      type: 'image/png',
    });

    fireEvent.change(screen.getByLabelText('تصویر پروفایل'), {
      target: { files: [file] },
    });

    const saveButton = await screen.findByRole('button', {
      name: 'ذخیره تصویر پروفایل',
    });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        '/api/profile/image',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
          }),
        }),
      );
      expect(onChange).toHaveBeenCalledWith(
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'تصویر با موفقیت ذخیره شد',
      );
    });
  });
});
