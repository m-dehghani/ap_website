import { useState } from 'react';

export default function SocialShare({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [message, setMessage] = useState('');
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const links = [
    {
      label: 'تلگرام',
      href: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
    },
    {
      label: 'واتساپ',
      href: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    },
    {
      label: 'ایکس',
      href: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
    },
  ];

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage('صفحه برای اشتراک‌گذاری آماده شد');
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage('پیوند کپی شد');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Shop share error:', error);
      setMessage('اشتراک‌گذاری انجام نشد');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-outline px-3 py-2 text-sm" onClick={share}>
        اشتراک‌گذاری
      </button>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          {link.label}
        </a>
      ))}
      <span aria-live="polite" className="sr-only">{message}</span>
    </div>
  );
}
