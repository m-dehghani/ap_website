import { useId, useState } from 'react';
import Image from 'next/image';

export type ImageUploadScope =
  | 'profile'
  | 'success-story'
  | 'testimonial'
  | 'coach'
  | 'news-article'
  | 'shop-product';

type ImageUploadFieldProps = {
  label: string;
  scope: ImageUploadScope;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  removable?: boolean;
};

const maxImageBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function ImageUploadField({
  label,
  scope,
  value,
  onChange,
  multiple = false,
  maxFiles = 1,
  removable = true,
}: ImageUploadFieldProps) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const currentImages = Array.isArray(value) ? value : value ? [value] : [];

  const uploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!files.length) return;

    if (!multiple && files.length !== 1) {
      setError('هر بار فقط یک تصویر انتخاب کنید');
      return;
    }
    if (multiple && currentImages.length + files.length > maxFiles) {
      setError(`حداکثر ${maxFiles} تصویر می‌توانید انتخاب کنید`);
      return;
    }
    const invalidFile = files.find(
      (file) =>
        !allowedTypes.has(file.type) ||
        file.size === 0 ||
        file.size > maxImageBytes,
    );
    if (invalidFile) {
      setError('فقط تصویر JPEG، PNG یا WebP تا حجم ۵ مگابایت پذیرفته می‌شود');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const response = await fetch(
          `/api/uploads?scope=${encodeURIComponent(scope)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          },
        );
        const result = await response.json();
        if (!response.ok || typeof result.url !== 'string') {
          throw new Error(result.message || 'بارگذاری تصویر ناموفق بود');
        }
        uploaded.push(result.url);
        onChange(multiple ? [...currentImages, ...uploaded] : uploaded[0]);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'بارگذاری تصویر ناموفق بود',
      );
    } finally {
      setBusy(false);
    }
  };

  const removeImage = (image: string) => {
    onChange(
      multiple
        ? currentImages.filter((current) => current !== image)
        : '',
    );
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        disabled={busy || (multiple && currentImages.length >= maxFiles)}
        onChange={uploadImages}
        aria-describedby={`${id}-help ${id}-status`}
        className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:ml-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:font-semibold file:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-wait disabled:opacity-60"
      />
      <p id={`${id}-help`} className="text-xs text-gray-600">
        فرمت‌های مجاز: JPEG، PNG و WebP؛ حداکثر ۵ مگابایت برای هر تصویر.
      </p>
      {busy && (
        <p role="status" className="text-sm text-primary-700">
          در حال بارگذاری تصویر...
        </p>
      )}
      <p
        id={`${id}-status`}
        role={error ? 'alert' : 'status'}
        className={error ? 'text-sm text-red-700' : 'sr-only'}
      >
        {error || 'تصویر انتخاب نشده است'}
      </p>
      {currentImages.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {currentImages.map((image, index) => (
            <li
              key={`${image}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
            >
              {image.startsWith('/api/uploads/') ? (
                <Image
                  src={image}
                  alt={`پیش‌نمایش تصویر ${index + 1}`}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <span className="text-xs text-gray-600">
                  تصویر فعلی حفظ می‌شود
                </span>
              )}
              {removable && (
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  disabled={busy}
                  className="rounded-md px-2 py-1 text-sm text-red-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-50"
                  aria-label={`حذف تصویر ${index + 1}`}
                >
                  حذف
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
