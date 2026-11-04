# Comprehensive UI/UX Improvement Implementation Plan

**Project:** AP Football Academy Website  
**Generated:** 2026-11-04  
**Sources:** Impeccable Detect (11 pages), Web Interface Guidelines, a11y-debugging, Manual Code Audit, E2E Tests  
**Total Items:** 68 | **Total Effort:** ~173 hours

---

## Executive Summary

| Phase | Priority | Items | Hours | Focus |
|-------|----------|-------|-------|-------|
| **Phase 1** | **Critical** | 17 | 40 | Color contrast (WCAG AA), accessibility violations, form compliance |
| **Phase 2** | **High** | 12 | 29 | Layout fixes, nested cards, column balance, typography, navigation |
| **Phase 3** | **Medium** | 26 | 67 | Performance, animations, dark mode, forms, shop, dashboards, admin |
| **Phase 4** | **Low** | 13 | 37 | Technical debt, i18n prep, testing infrastructure |

---

## Phase 1: Critical - Color Contrast & Accessibility (Week 1)
**Goal:** Zero WCAG AA violations, full keyboard accessibility, compliant forms

### Color Contrast Fixes (Impeccable Detect - 10 violations across all pages)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 1.1 | **Migrate all Tailwind defaults → DESIGN.md tokens** | All 11 | 8 | `impeccable detect` shows zero low-contrast |
| 1.2 | Replace `#ef4444` (red-500) → `#dc2626` (club-red) | All | - | Buttons, links, focus states use club-red |
| 1.3 | Replace `#fe9a00` (amber-500) → `#ea580c` (training-orange) | Home, Shop | - | Badges, secondary actions use training-orange |
| 1.4 | Replace `#0284c7` (sky-500) → `#dc2626` (club-red) | All | - | No cyan backgrounds with white text |
| 1.5 | Replace `#22c55e` (emerald-500) → `#16a34a` (growth-green) | Programs | - | Success states use growth-green |
| 1.6 | Replace `#e438b2` (pink) → `#dc2626` (club-red) | Coaches | - | Social links, gradients use club-red |
| 1.7 | Replace `#ef4444` (red-500) → `#dc2626` (club-red) | Coaches | - | Gradient endpoints use club-red |
| 1.8 | Fix News dashboard gradient text contrast (7 violations) | News | 3 | Solid overlays or darker text on gradients |
| 1.9 | **Remove all gradient text (`background-clip: text`)** | All 11 | 4 | Zero `gradient-text` anti-patterns |
| 1.10 | Create design token utility classes in `globals.css` | All | 2 | `.bg-club-red`, `.text-club-red`, etc. available |

### Accessibility Fixes (Web Interface Guidelines + a11y-debugging)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 1.11 | Add `aria-label` to all icon-only buttons | All | 3 | Hero pagination, autoplay, favorites, mobile menu, theme picker |
| 1.12 | Fix heading hierarchy skip (h1→h3) on Programs | Programs | 1 | Logical h1→h2→h3 progression |
| 1.13 | Add focus trap to mobile menu | All (mobile) | 2 | Tab cycles within `#mobile-navigation` only |
| 1.14 | Verify all form inputs have labels (`htmlFor`/`id`) | Register, Contact, Shop | 2 | Zero orphaned inputs |
| 1.15 | Add `aria-live="polite"` to toast containers | All | 1 | Screen readers announce toasts |
| 1.16 | Verify skip-to-content link functional | All | 1 | Visible on focus, jumps to `#main-content` |

### Form Compliance (Web Interface Guidelines)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 1.17 | Add `autocomplete` to all inputs | Register, Contact, Login | 2 | given-name, family-name, email, tel, new-password, bday |
| 1.18 | `spellCheck={false}` on email/phone/password | Register, Contact, Login | 1 | No spellcheck on sensitive fields |
| 1.19 | Submit buttons: loading spinner + disabled state | Register, Contact, Shop | 2 | "در حال ارسال…" with spinner during submit |
| 1.20 | Inline errors + focus first error on submit | Register, Contact | 2 | First invalid field focused on submit failure |

---

## Phase 2: High - Layout, Structure & Typography (Week 2)
**Goal:** Clean visual hierarchy, balanced layouts, proper typography

### Layout Fixes (Impeccable Detect)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 2.1 | **Flatten 9 nested cards** (7 Programs, 1 Shop, 1 Contact) | Programs, Shop, Contact | 6 | Zero `nested-cards` anti-patterns |
| 2.2 | Balance Programs columns (165% vs 81% viewport) | Programs | 3 | Columns balanced or content flows below fold |
| 2.3 | Balance Coaches columns (141% vs 91% viewport) | Coaches | 3 | Columns balanced or content flows below fold |
| 2.4 | Remove 6 codex grid backgrounds (AI tell) | Home, Contact, Success, Testimonials, About, Coaches | 2 | Zero `codex-grid-background` advisories |

### Typography (Web Interface Guidelines + Impeccable)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 2.5 | Add `text-wrap: pretty` to body copy (fix 5 stragglers) | Home, Testimonials, Coaches, News | 1 | No `straggler` advisories |
| 2.6 | **Replace Poppins/Inter → Vazirmatn globally** | All | 2 | Only Vazirmatn loaded; no fallback flashes |
| 2.7 | Add `text-wrap: balance` to headings | All | 1 | Headlines have balanced wrapping |
| 2.8 | Use `font-variant-numeric: tabular-nums` for number columns | Programs, Shop, Dashboard | 1 | Numbers align in tables |

### Navigation & Responsive

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 2.9 | Add breadcrumb navigation | Shop/[slug], Admin/*, Student/*, Coach/* | 4 | Breadcrumbs on all deep pages |
| 2.10 | Consolidate duplicate nav links (single NAVIGATION source) | All | 2 | Single source of truth |
| 2.11 | Fix Shop comparison table mobile overflow | Shop | 2 | No horizontal scroll on mobile |
| 2.12 | Hero stats: 3 cols → 1/2 cols at 320px | Home | 1 | Stats readable at 320px |
| 2.13 | Coach spotlight: stack portrait above details at 768px | Coaches | 2 | Portrait above details on tablet |

---

## Phase 3: Medium - Performance, Animation, Dark Mode, Features (Week 3)
**Goal:** Fast, smooth, accessible in both themes; feature-complete dashboards

### Performance (Web Interface Guidelines)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.1 | Enable Next.js Image optimization (remove `unoptimized`) | All | 2 | All images optimized; domains configured |
| 3.2 | Add LQIP blur placeholders for hero images | Home, Coaches, Shop | 3 | Hero images have blur-up |
| 3.3 | Preload Vazirmatn font (`rel="preload" as="font"`) | All | 1 | Font preloaded with `font-display: swap` |
| 3.4 | Add `preconnect` for CDN/asset domains | All | 1 | Preconnect headers present |
| 3.5 | Virtualize large lists (>50 items) | Admin, Student dashboard | 4 | `content-visibility: auto` or virtua |

### Animation (Web Interface Guidelines)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.6 | Honor `prefers-reduced-motion` on ALL Framer Motion | Home, Programs, Coaches | 3 | Particle canvas, 3D tilt, hover animations respect |
| 3.7 | Animate `transform`/`opacity` only (compositor-friendly) | All animated | 2 | No layout-triggering animations |
| 3.8 | Pause/stop controls for autoplay >5s | Home, News | 2 | Carousels have pause buttons |

### Dark Mode (DESIGN.md + Web Interface Guidelines)

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.9 | Verify all sections use dark-* tokens in dark mode | All | 4 | No light surfaces in dark theme |
| 3.10 | Add `color-scheme: dark` on `<html>` for dark theme | All | 1 | Dark scrollbars, inputs styled |
| 3.11 | Add `<meta name="theme-color">` matching background | All | 1 | Theme color matches (light: #f8fafc, dark: #160f12) |
| 3.12 | Native `<select>` explicit colors for Windows dark mode | All | 1 | Selects readable in dark mode |

### Forms Enhancement

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.13 | PersianDatePicker full accessibility (keyboard, ARIA, SR) | Register | 3 | Date picker fully accessible |
| 3.14 | Password strength meter (visual during input) | Register | 2 | Strength shown during input |
| 3.15 | Auto-save registration draft to localStorage (30s) | Register | 3 | Draft persists across reloads |

### Shop Enhancements

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.16 | Image gallery with lightbox zoom | Shop/[slug] | 4 | Product images zoomable |
| 3.17 | Visual color swatches for variants | Shop/[slug] | 3 | Colors shown as swatches |
| 3.18 | Review sorting (Most helpful, Verified purchase) | Shop/[slug] | 2 | Sorting options available |
| 3.19 | Stock urgency badge with pulse animation | Shop/[slug] | 1 | Low stock badge animated |

### Student Dashboard

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.20 | Keyboard tab navigation (←/→ arrows) | Student dashboard | 2 | Tabs keyboard navigable |
| 3.21 | Payment history expandable rows + receipt download | Student dashboard | 3 | Payments expandable |
| 3.22 | Attendance calendar heatmap (green/red dots) | Student dashboard | 4 | Heatmap displayed |
| 3.23 | Evaluation progress charts (Chart.js/Recharts) | Student dashboard | 4 | Charts displayed |

### Admin Enhancements

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 3.24 | Sortable tables + column visibility toggle | Admin/* | 4 | Tables fully featured |
| 3.25 | Bulk actions (checkbox + bulk approve/delete) | Admin/* | 3 | Bulk operations work |
| 3.26 | Search/filter with shareable URL state | Admin/* | 3 | Filters in query params |
| 3.27 | Illustrated empty states with CTAs | Admin/* | 2 | Empty states have illustrations |

---

## Phase 4: Low - Technical Debt, i18n Prep, Testing (Week 4+)
**Goal:** Maintainable codebase, future-proof, quality gates

### Technical Debt

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 4.1 | Split Hero.tsx (700+ lines) → HeroCarousel, HeroStats, HeroNews, HeroPagination | Home | 4 | Components separated |
| 4.2 | Split Programs.tsx (734 lines) → ProgramCard, ComparisonTable, CoachCard, EnrollmentCTA | Programs | 4 | Components separated |
| 4.3 | Refactor register.tsx (632 lines) → Multi-step form with RHF | Register | 6 | Registration as stepper |
| 4.4 | Audit unused CSS variables (34KB → lean) | All | 3 | No unused custom properties |
| 4.5 | Move design tokens to `design-tokens.ts` (single source) | All | 2 | Tokens shared across Tailwind/CSS/JS |

### i18n Preparation

| # | Task | Pages | Hours | Acceptance Criteria |
|---|------|-------|-------|---------------------|
| 4.6 | Abstract date formatting → `formatDate(locale)` | All | 2 | Date formatting abstracted |
| 4.7 | Abstract number formatting → `formatNumber(locale)` | All | 2 | `toPersianDigits` → `formatNumber` |
| 4.8 | Abstract currency → `formatCurrency(amount, 'IRR')` | All | 2 | Toman hardcoded → abstracted |

### Testing Infrastructure

| # | Task | Target | Hours | Acceptance Criteria |
|---|------|--------|-------|---------------------|
| 4.9 | Add axe-core to CI pipeline | CI/CD | 2 | Automated a11y on PR |
| 4.10 | Visual regression testing (Chromatic/Percy) | CI/CD | 3 | Component visual regression |
| 4.11 | Lighthouse CI with budgets (LCP<2.5s, CLS<0.1, INP<200ms) | CI/CD | 2 | Performance budgets enforced |
| 4.12 | Cross-browser RTL testing (Firefox, Chrome, Safari) | All | 3 | RTL works in all browsers |
| 4.13 | Real device mobile testing (44x44px touch targets) | Mobile | 2 | Touch targets verified on device |

---

## Dependency Graph

```
Phase 1 (Critical) ──┬──→ Phase 2 (High) ──┬──→ Phase 3 (Medium)
  │                   │                    │
  ├── Design tokens   ├── Design tokens    ├── Design tokens
  ├── Color contrast  ├── Layout fixes     ├── Dark mode tokens
  └── Accessibility   └── Typography       └── Performance baseline
                      └── Responsive
```

**Critical Path:** Design token migration (1.1) → All color fixes → Layout fixes → Dark mode verification

---

## Quick Wins (Can Start Today - < 2 hours each)

| Task | File | Effort | Impact |
|------|------|--------|--------|
| Add `text-wrap: pretty` to prose | `globals.css` | 5 min | Fixes 5 straggler advisories |
| Replace `bg-sky-500` → `bg-primary-600` | All components | 30 min | Fixes cyan contrast (all pages) |
| Replace `bg-amber-500` → `bg-secondary-600` | All components | 30 min | Fixes orange contrast (Home, Shop) |
| Replace `bg-emerald-500` → `bg-accent-600` | All components | 30 min | Fixes green contrast (Programs) |
| Remove `bg-clip-text` gradient text | All pages | 1 hour | Removes AI-tell + contrast issues |
| Add design token CSS utilities | `globals.css` | 30 min | Enables token migration |
| Flatten 1 nested card (Contact form) | `contact.tsx` | 30 min | Reduces visual noise |

---

## Verification Checklist

### After Phase 1
- [ ] `impeccable detect http://localhost:3000` → 0 anti-patterns
- [ ] `impeccable detect` on all 11 pages → 0 low-contrast, 0 gradient-text
- [ ] Lighthouse accessibility score = 1.0
- [ ] Tab navigation works on all pages (mobile + desktop)
- [ ] Screen reader announces toasts, form errors

### After Phase 2
- [ ] `impeccable detect` → 0 nested-cards, 0 column-overflow, 0 heading-skip
- [ ] No codex-grid-background advisories
- [ ] No straggler advisories
- [ ] Breadcrumbs on all deep pages
- [ ] Mobile layouts at 320px, 390px, 768px, 1440px verified

### After Phase 3
- [ ] Dark mode: no light sections, proper scrollbars, theme-color meta
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms (Lighthouse)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Student/Admin dashboards feature-complete
- [ ] Shop product detail fully featured

### After Phase 4
- [ ] Component files < 300 lines each
- [ ] Design tokens in single `design-tokens.ts`
- [ ] CI runs axe-core, visual regression, Lighthouse
- [ ] Cross-browser RTL verified

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Design token migration breaks dark mode | Medium | High | Test both themes after each token change |
| Framer Motion reduced-motion breaks animations | Low | Medium | Test with `emulateMedia({ reducedMotion: 'reduce' })` |
| Next.js Image optimization breaks external images | Medium | Medium | Configure `remotePatterns` in `next.config.ts` |
| Vazirmatn font loading causes layout shift | Low | High | Preload font, use `font-display: swap`, reserve space |
| Admin table virtualization breaks sorting | Low | Medium | Test with `content-visibility: auto` first |

---

## Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Impeccable anti-patterns | 48 | 0 | `impeccable detect` |
| Lighthouse Accessibility | ~0.85 | 1.0 | Lighthouse CI |
| Lighthouse Performance | ~0.70 | >0.90 | Lighthouse CI |
| LCP (mobile) | ~3.5s | <2.5s | Lighthouse CI |
| CLS | ~0.15 | <0.1 | Lighthouse CI |
| INP | ~300ms | <200ms | Lighthouse CI |
| WCAG AA Contrast violations | 10 | 0 | axe-core / Impeccable |
| Keyboard navigation issues | 5+ | 0 | Manual + a11y-debugging |

---

## Next Steps

1. **Immediate:** Run quick wins (globals.css, token utilities, straggler fix)
2. **Day 1-2:** Complete design token migration (1.1-1.10)
3. **Day 3-5:** Fix all color contrast + accessibility (1.11-1.20)
4. **Week 2:** Phase 2 layout + typography
5. **Week 3:** Phase 3 features + performance
6. **Week 4+:** Phase 4 technical debt + testing

---

*This plan consolidates findings from Impeccable Detect (11 pages), Web Interface Guidelines compliance, a11y-debugging workflows, manual code audit of 50+ files, and existing E2E test coverage. All items are non-contradictory and sequenced by dependency.*