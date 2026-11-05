import { useState } from 'react';
import type { ChangeEvent } from 'react';

interface VideoMediaFieldsProps {
  scope: 'product' | 'news';
  uploadedVideoUrl: string;
  aparatVideoUrl: string;
  onUploadedVideoChange: (value: string) => void;
  onAparatVideoChange: (value: string) => void;
}

export default function VideoMediaFields({
  scope,
  uploadedVideoUrl,
  aparatVideoUrl,
  onUploadedVideoChange,
  onAparatVideoChange,
}: VideoMediaFieldsProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputId = `${scope}-video-upload`;
  const hintId = `${scope}-video-hint`;

  const uploadVideo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const response = await fetch(`/api/uploads/video?scope=${scope}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-Upload-Filename': encodeURIComponent(file.name),
        },
        body: file,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'بارگذاری ویدئو ناموفق بود');
      }
      onUploadedVideoChange(result.url);
      event.target.value = '';
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'بارگذاری ویدئو ناموفق بود',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
      <legend className="px-1 font-bold text-slate-900">ویدئوی محتوا</legend>
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800">
          بارگذاری ویدئوی MP4 یا WebM
        </label>
        <p id={hintId} className="text-sm leading-6 text-slate-600">
          سقف بارگذاری در ورسل ۴ مگابایت و در سایر سرورها ۱۰۰ مگابایت است.
        </p>
        <input
          id={inputId}
          type="file"
          accept="video/mp4,video/webm,.mp4,.webm"
          aria-describedby={hintId}
          disabled={uploading}
          onChange={(event) => void uploadVideo(event)}
          className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 file:ml-3 file:min-h-9 file:rounded-md file:border-0 file:bg-red-50 file:px-3 file:font-semibold file:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60"
        />
        {uploading && (
          <p role="status" className="text-sm font-medium text-slate-700">
            در حال بارگذاری ویدئو…
          </p>
        )}
        {uploadError && (
          <p role="alert" className="text-sm font-medium text-red-800">
            {uploadError}
          </p>
        )}
        {uploadedVideoUrl && (
          <div className="space-y-3">
            <video
              aria-label="پیش‌نمایش ویدئوی بارگذاری‌شده"
              controls
              muted
              playsInline
              preload="metadata"
              width={640}
              height={360}
              src={uploadedVideoUrl}
              className="aspect-video w-full rounded-lg bg-black object-contain"
            />
            <button
              type="button"
              onClick={() => onUploadedVideoChange('')}
              className="min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 underline-offset-4 hover:bg-red-50 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              حذف ویدئوی انتخاب‌شده
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`${scope}-aparat-url`}
          className="block text-sm font-semibold text-slate-800"
        >
          نشانی ویدئو در آپارات
        </label>
        <p id={`${scope}-aparat-hint`} className="text-sm leading-6 text-slate-600">
          نشانی کامل HTTPS مانند https://www.aparat.com/v/شناسه را وارد کنید.
          بارگذاری در آپارات از اینجا پشتیبانی نمی‌شود.
        </p>
        <input
          id={`${scope}-aparat-url`}
          type="url"
          inputMode="url"
          dir="ltr"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={`${scope}-aparat-hint`}
          value={aparatVideoUrl}
          onChange={(event) => onAparatVideoChange(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        />
        {aparatVideoUrl && (
          <button
            type="button"
            onClick={() => onAparatVideoChange('')}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 underline-offset-4 hover:bg-slate-50 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            حذف نشانی آپارات
          </button>
        )}
      </div>
    </fieldset>
  );
}
