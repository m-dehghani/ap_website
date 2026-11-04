import { getAparatEmbedUrl } from '@/lib/aparat';

interface VideoPlayerProps {
  title: string;
  uploadedVideoUrl?: string | null;
  aparatVideoUrl?: string | null;
}

const safeUploadedVideoPath =
  /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm)$/i;

export default function VideoPlayer({
  title,
  uploadedVideoUrl,
  aparatVideoUrl,
}: VideoPlayerProps) {
  const uploadedUrl =
    uploadedVideoUrl && safeUploadedVideoPath.test(uploadedVideoUrl)
      ? uploadedVideoUrl
      : null;
  const embedUrl = aparatVideoUrl ? getAparatEmbedUrl(aparatVideoUrl) : null;
  if (!uploadedUrl && !embedUrl) return null;

  return (
    <div className="mt-8 grid gap-6">
      {uploadedUrl && (
        <video
          aria-label={`ویدئوی ${title}`}
          controls
          muted
          playsInline
          preload="metadata"
          width={1280}
          height={720}
          className="aspect-video w-full rounded-xl bg-black object-contain"
          src={uploadedUrl}
        >
          مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
        </video>
      )}
      {embedUrl && (
        <iframe
          title={`ویدئوی ${title} در آپارات`}
          src={embedUrl}
          loading="lazy"
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full rounded-xl border-0 bg-black"
        />
      )}
    </div>
  );
}
