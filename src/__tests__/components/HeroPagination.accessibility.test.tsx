import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import HeroPagination from '@/components/hero/HeroPagination';

describe('Hero pagination accessibility', () => {
  it('exposes accessible names and pressed states without axe violations', async () => {
    const { container } = render(
      <main>
        <h1>اسلایدهای آکادمی</h1>
        <HeroPagination
          slideCount={2}
          newsSlides={[]}
          currentSlide={0}
          currentNewsSlide={0}
          onSlideChange={() => undefined}
          onNewsChange={() => undefined}
          canAutoplay={false}
          isAutoplayRunning={false}
          reducedMotion={false}
          motionOverride={false}
          onMotionOverride={() => undefined}
          onAutoplayPauseToggle={() => undefined}
        />
      </main>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
