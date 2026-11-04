/**
 * Semantic token references shared by runtime TypeScript and Tailwind.
 * The literal values live in globals.css so CSS consumers use the same source.
 */
export const DESIGN_TOKENS = {
  color: {
    clubRed: 'var(--club-red)',
    clubRedDeep: 'var(--club-red-deep)',
    trainingOrange: 'var(--training-orange)',
    growthGreen: 'var(--growth-green)',
    achievementGold: 'var(--achievement-gold)',
    warmCharcoal: 'var(--warm-charcoal)',
    body: 'var(--body-slate)',
    heading: 'var(--heading-ink)',
    border: 'var(--border-slate)',
  },
  fontFamily: {
    display: 'Vazirmatn',
    body: 'Vazirmatn',
  },
  layout: {
    contentMaxWidth: 'var(--content-max-width)',
    sidebarWidth: 'var(--sidebar-width)',
  },
} as const;
