import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProductGallery from '@/components/shop/ProductGallery';

/* eslint-disable @next/next/no-img-element -- Native image mocks keep next/image behavior testable in jsdom. */
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    fill?: boolean;
  }) => {
    void fill;
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('ProductGallery', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens the selected image in an accessible dialog and closes it with Escape', () => {
    render(
      <ProductGallery
        name="پیراهن تمرینی"
        images={['/api/uploads/front.webp', '/api/uploads/back.webp']}
      />,
    );

    fireEvent.click(
      within(screen.getByRole('group', { name: 'تصاویر محصول' })).getByRole(
        'button',
        { name: 'نمایش تصویر ۲' },
      ),
    );
    const mainImageButton = screen
      .getAllByRole('button', { name: 'نمایش تصویر ۲' })
      .find((button) => !button.hasAttribute('aria-pressed'));
    if (!mainImageButton) throw new Error('Main image control was not rendered');
    fireEvent.click(mainImageButton);
    const dialog = screen.getByRole('dialog', { name: 'پیراهن تمرینی' });
    expect(dialog).toHaveAttribute('open');
    expect(
      within(dialog).getByRole('img', {
        name: 'پیراهن تمرینی - تصویر ۲',
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(dialog).not.toHaveAttribute('open');
  });
});
