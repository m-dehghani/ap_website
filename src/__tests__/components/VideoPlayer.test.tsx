import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VideoPlayer from '@/components/VideoPlayer';

describe('VideoPlayer', () => {
  it('starts uploaded video muted with native controls and no autoplay', () => {
    render(
      <VideoPlayer
        title="تمرین فوتبال"
        uploadedVideoUrl="/uploads/550e8400-e29b-41d4-a716-446655440000.mp4"
      />,
    );

    const player = screen.getByLabelText('ویدئوی تمرین فوتبال');
    expect(player.tagName).toBe('VIDEO');
    expect(player).toHaveAttribute('controls');
    expect(player).toHaveProperty('muted', true);
    expect(player).toHaveAttribute('playsinline');
    expect(player).not.toHaveAttribute('autoplay');
    expect(player).toHaveAttribute(
      'src',
      '/uploads/550e8400-e29b-41d4-a716-446655440000.mp4',
    );
  });

  it('embeds only canonical Aparat URLs without autoplay and allows fullscreen', () => {
    render(
      <VideoPlayer
        title="گزارش مسابقه"
        aparatVideoUrl="https://www.aparat.com/v/abc123"
      />,
    );

    const player = screen.getByTitle('ویدئوی گزارش مسابقه در آپارات');
    expect(player).toHaveAttribute(
      'src',
      'https://www.aparat.com/video/video/embed/videohash/abc123',
    );
    expect(player).toHaveAttribute('allowfullscreen');
    expect(player).not.toHaveAttribute('autoplay');
  });

  it('does not render a frame for an untrusted provider URL', () => {
    const { container } = render(
      <VideoPlayer
        title="ویدئو"
        aparatVideoUrl="https://www.aparat.com.evil.example/v/abc123"
      />,
    );

    expect(container.querySelector('iframe')).toBeNull();
  });
});
