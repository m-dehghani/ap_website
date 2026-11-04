import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { imageOptimizationProps } from '@/lib/image-optimization';
import { formatNumber } from '@/lib/format';

export default function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (lightboxOpen && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!lightboxOpen && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [lightboxOpen]);

  if (images.length === 0) {
    return (
      <div
        role="img"
        aria-label={`تصویر ${name} موجود نیست`}
        className="flex aspect-square items-center justify-center rounded-2xl bg-slate-100 text-5xl text-slate-300"
      >
        ⚽
      </div>
    );
  }

  const currentImage = images[selectedIndex] ?? images[0];
  const persianNumber = (value: number) => formatNumber(value);
  const selectImage = (index: number) => {
    setSelectedIndex((index + images.length) % images.length);
  };

  return (
    <div className="grid content-start gap-3">
      <button
        type="button"
        aria-label={`نمایش تصویر ${persianNumber(selectedIndex + 1)}`}
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <Image
          src={currentImage}
          alt={`${name} - تصویر ${persianNumber(selectedIndex + 1)}`}
          fill
          {...imageOptimizationProps(currentImage)}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </button>
      {images.length > 1 && (
        <div
          role="group"
          className="flex flex-wrap gap-2"
          aria-label="تصاویر محصول"
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`نمایش تصویر ${persianNumber(index + 1)}`}
              aria-pressed={selectedIndex === index}
              className={`relative size-16 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                selectedIndex === index
                  ? 'border-primary-600'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                {...imageOptimizationProps(image)}
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={name}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,64rem)] max-w-none overflow-visible rounded-2xl border-0 bg-slate-950 p-3 text-white shadow-2xl backdrop:bg-black/80"
        onCancel={(event) => {
          event.preventDefault();
          setLightboxOpen(false);
        }}
        onClose={() => setLightboxOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            setLightboxOpen(false);
          }
          if (event.key === 'ArrowRight') selectImage(selectedIndex + 1);
          if (event.key === 'ArrowLeft') selectImage(selectedIndex - 1);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setLightboxOpen(false);
        }}
      >
        <button
          type="button"
          autoFocus
          aria-label="بستن تصویر بزرگ"
          onClick={() => setLightboxOpen(false)}
          className="absolute -top-3 left-0 z-10 flex size-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        </button>
        <div className="relative aspect-square max-h-[84dvh]">
          <Image
            src={currentImage}
            alt={`${name} - تصویر ${persianNumber(selectedIndex + 1)}`}
            fill
            {...imageOptimizationProps(currentImage)}
            sizes="92vw"
            className="object-contain"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              aria-label="تصویر قبلی"
              onClick={() => selectImage(selectedIndex - 1)}
              className="min-h-11 rounded-lg px-4 font-semibold text-white underline underline-offset-4"
            >
              قبلی
            </button>
            <span className="self-center text-sm text-slate-200" aria-live="polite">
              تصویر {persianNumber(selectedIndex + 1)} از{' '}
              {persianNumber(images.length)}
            </span>
            <button
              type="button"
              aria-label="تصویر بعدی"
              onClick={() => selectImage(selectedIndex + 1)}
              className="min-h-11 rounded-lg px-4 font-semibold text-white underline underline-offset-4"
            >
              بعدی
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
