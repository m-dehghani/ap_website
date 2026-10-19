import { useEffect, useRef, useState } from 'react';

const LOCALIZED_DIGITS = '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩';
const LOCALIZED_DIGIT_PATTERN = /[۰-۹٠-٩]/g;

export function useAnimatedStat(number: string) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    let animationFrame: number;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        const digits = number.replace(LOCALIZED_DIGIT_PATTERN, (digit) =>
          String(LOCALIZED_DIGITS.indexOf(digit) % 10),
        );
        const targetValue = Number.parseInt(digits.replace(/\D/g, ''), 10);

        if (Number.isNaN(targetValue)) {
          animationFrame = requestAnimationFrame(() =>
            setDisplayValue(number),
          );
          return;
        }

        const suffix = number.replace(/[0-9۰-۹٠-٩]/g, '');
        const startTime = performance.now();
        const animate = (time: number) => {
          const progress = Math.min((time - startTime) / 2000, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = Math.floor(targetValue * easedProgress);

          setDisplayValue(
            `${currentValue.toLocaleString('fa-IR')}${suffix}`,
          );

          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          } else {
            setDisplayValue(number);
          }
        };

        animationFrame = requestAnimationFrame(animate);
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [number]);

  return { elementRef, displayValue };
}
