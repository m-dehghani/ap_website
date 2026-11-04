import { useState } from 'react';
import Image from 'next/image';

type ProfileAvatarProps = {
  image?: string | null;
  initials: string;
  size: number;
};

function getImageSource(image?: string | null): string | null {
  const value = image?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return null;
}

export default function ProfileAvatar({
  image,
  initials,
  size,
}: ProfileAvatarProps) {
  const imageSource = getImageSource(image);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary-600 to-primary-800 text-sm font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(14, Math.round(size * 0.32)),
      }}
    >
      {imageSource && failedSource !== imageSource ? (
        <Image
          src={imageSource}
          alt=""
          fill
          sizes={`${size}px`}
          unoptimized
          className="object-cover"
          onError={() => setFailedSource(imageSource)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
