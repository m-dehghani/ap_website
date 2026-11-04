---
name: AP Football Academy
description: Current visual system for the Persian- and English-language academy website.
colors:
  club-red: "#dc2626"
  club-red-deep: "#b91c1c"
  training-orange: "#ea580c"
  growth-green: "#16a34a"
  achievement-gold: "#ca8a04"
  warm-charcoal: "#241519"
  paper: "#f8fafc"
  surface-white: "#ffffff"
  body-slate: "#334155"
  heading-ink: "#0f172a"
  border-slate: "#cbd5e1"
  dark-ground: "#160f12"
  dark-surface: "#24191d"
  dark-raised: "#3b252b"
  dark-text: "#fff1f3"
  dark-text-muted: "#d8c5cb"
  dark-border: "#493239"
typography:
  display:
    fontFamily: "Poppins, Inter, system-ui, sans-serif"
  headline:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.25
  title:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.5vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  2xl: "1.5rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
  4xl: "6rem"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.club-red} 0%, {colors.club-red-deep} 100%)"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "linear-gradient(135deg, {colors.training-orange} 0%, #c2410c 100%)"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.club-red}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.body-slate}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.heading-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  nav-link:
    backgroundColor: "rgba(255, 255, 255, 0.9)"
    textColor: "{colors.body-slate}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
---

# Design System: AP Football Academy

## Overview

**Creative North Star: "The Matchday Signal"**

*Inferred from the implemented interface because a product owner was unavailable for the visual-language interview; this is a descriptive shorthand, not a confirmed brand commitment.*

The current site pairs a football-led, high-energy first impression with practical browsing surfaces. A red and warm-charcoal hero, sports photography, achievement highlights, and gradient actions establish momentum; white cards and generous section spacing carry programs, products, and news. Orange, green, and gold distinguish secondary actions and content accents rather than replacing the red-led core.

The implementation also includes a dark theme, rounded controls, translucent panels, and layered shadows. In the rendered homepage, dark styling is not applied uniformly to every section, so new work should follow the actual theme tokens and verify both themes rather than assume automatic coverage. No visual anti-reference or rejection was confirmed.

**Key Characteristics:**
- Sport-led and energetic, with a red-centered action hierarchy.
- Image-forward sections balanced by clear, light content surfaces.
- Rounded cards and controls with gradients, translucency, and visible elevation.
- Persian-first typography and layout with a responsive English counterpart.

## Colors

The palette is anchored by club red and warm charcoal, with orange, green, and gold accents set against cool, light neutrals.

### Primary
- **Club Red**: The main action color for calls to action, active navigation, focus, and gradient treatments.
- **Club Red Deep**: The darker endpoint for primary gradients and hover states.

### Secondary
- **Training Orange**: A contrasting action and highlight color, especially for secondary actions.

### Tertiary
- **Growth Green**: A success and progress accent used in content cards and status-oriented highlights.
- **Achievement Gold**: A smaller premium and achievement accent.

### Neutral
- **Warm Charcoal**: The dark, red-brown base used in the footer and sports-led hero treatments.
- **Paper**: The default page canvas in light mode.
- **Surface White**: The default card and form surface in light mode.
- **Body Slate**: Supporting text on light surfaces.
- **Heading Ink**: High-emphasis text and headings on light surfaces.
- **Border Slate**: Light-mode control and surface separation.
- **Dark Ground / Dark Surface / Dark Raised**: The layered background values defined for dark mode.
- **Dark Text / Dark Text Muted / Dark Border**: Text and separation values defined for dark mode.

**The Active Palette Rule.** Use the named utility palette as the source for new work. The separate `--navy-color` custom property is unused and blue-toned, while the active `navy-*` Tailwind ramp is warm charcoal; do not treat them as interchangeable tokens.

## Typography

**Display Font:** Poppins, Inter, system-ui, sans-serif (configured as a utility stack; Poppins and Inter are not imported by the global stylesheet)
**Body Font:** Vazirmatn, system-ui, sans-serif
**Label/Mono Font:** Vazirmatn, system-ui, sans-serif

**Character:** Vazirmatn is the loaded global face and carries Persian and English body copy and base headings. A small number of display headings request the configured Poppins/Inter stack, but those fonts are not loaded by the global stylesheet and may fall back to a system font.

### Hierarchy
- **Display:** Large, fluid display styles are available for image-led feature headings; use the configured display stack only where the existing component does.
- **Headline:** Heavy Vazirmatn with fluid sizing and compact line-height for page and section headings.
- **Title:** Bold Vazirmatn for card titles and section labels.
- **Body:** Regular Vazirmatn with generous paragraph leading for Persian and English reading.
- **Label:** Medium Vazirmatn for buttons, navigation, badges, and form labels.

**The Loaded-Font Rule.** Prefer the globally loaded Vazirmatn stack for new typography; do not assume the separately configured Poppins/Inter stacks are available at runtime.

## Layout

The public site uses a centered, responsive container: up to `80rem` wide with `1rem` mobile gutters, `1.5rem` from the small breakpoint, and `2rem` at large screens. Narrow reading and form regions use a `64rem` maximum. Sections generally move from single-column mobile layouts to two columns at medium widths and three or four columns on larger screens; the primary navigation changes to a compact menu below the large breakpoint.

Spacing is generous at section level, with content cards arranged in clear grids and centered page introductions. Preserve RTL flow for Persian and the corresponding LTR direction for English. A rendered homepage check at `1440px` and `390px` showed no horizontal overflow at those widths.

## Elevation & Depth

Depth is layered rather than flat: white cards use soft neutral shadows, interactive cards can lift on hover, and glass panels combine translucency, blur, a fine border, and a stronger shadow. Large hero and footer areas rely more on gradient and tonal contrast than on card elevation. The global sheet defines five neutral shadow levels; glass surfaces use the stronger middle levels, while Tailwind utilities add larger card and hover shadows.

**The State-Lift Rule.** Keep ordinary content readable on its surface; reserve stronger lift and colored shadow for prominent cards or interaction states.

## Shapes

The form language is softly rounded throughout: buttons and fields use a medium curve, cards use a broader curve, and compact account controls and badges use pill or circular silhouettes. Inputs retain a visible border; cards alternate between clean white fills, subtle borders, and elevated treatments. Avoid sharp, square geometry when extending these components.

## Components

### Buttons
- **Character:** Confident, colorful actions with clear hover, focus, and pressed feedback.
- **Primary:** Red gradient with white text; the most prominent action.
- **Secondary:** Orange gradient for a distinct supporting action.
- **Outline / Ghost:** Red outline or quiet text treatment for lower-emphasis actions.
- **States:** Hover deepens the gradient and can lift the button; focus uses a visible ring; disabled and loading states remain visibly distinct.

### Cards / Containers
- **Character:** White, rounded surfaces organize programs, products, news, and dashboard content.
- **Variants:** Default elevated, outlined, glass, and stronger elevated cards are present.
- **Interaction:** Interactive cards may lift or scale slightly on hover; non-interactive content stays calm.
- **Glass treatment:** Translucent white with backdrop blur and a subtle border, primarily over dark or image-led backgrounds.

### Inputs / Fields
- **Character:** Familiar, full-width fields with a light fill and visible border.
- **Focus:** Red focus ring and border treatment.
- **Error:** Red border and supporting message; dark mode changes the field surface and border.
- **Labels and helper text:** Sit directly above or below the field in the Vazirmatn stack.

### Navigation
- **Desktop:** Sticky, translucent white header with a soft backdrop blur; active destinations receive a pale red treatment and the shop link is a filled action.
- **Mobile:** Collapsible vertical navigation with generous tap rows and full-width registration and login actions.
- **Account state:** Profile menu is a rounded, elevated panel with account actions and the theme control.

### Sports Hero
- **Character:** A data-driven, football-themed hero combines dark red gradients, imagery, achievement statistics, calls to action, and restrained particle motion.
- **Behavior:** Slides and motion respect reduced-motion preferences. Keep its dynamic content and existing sports assets intact when refining the component.

## Do's and Don'ts

### Do:
- **Do** use the existing red-led palette and established orange, green, and gold accents.
- **Do** keep the centered responsive containers, generous section spacing, and card-based content grids.
- **Do** use Vazirmatn as the dependable default and preserve Persian RTL and English LTR behavior.
- **Do** check dark-mode surfaces explicitly; the current rendered site contains sections that remain light in dark mode.
- **Do** preserve clear focus, error, disabled, and reduced-motion states in interactive components.

### Don't:
- **Don't** treat the unused blue-toned `--navy-color` property as the active warm `navy-*` palette.
- **Don't** assume Poppins or Inter is loaded just because the Tailwind font stacks are configured.
- **Don't** assume the dark theme automatically recolors every hard-coded light section.
- **Don't** add new accent hues or replace existing sports imagery without a surface-specific brief.
- **Don't** present this inferred North Star or color naming as a user-confirmed brand decision.
