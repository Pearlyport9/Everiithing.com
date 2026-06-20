# Everiithing•com — Design System

## Brand Identity
**Positioning**: Nigeria's most trusted home services marketplace
**Voice**: Direct. Confident. Reassuring. Never corporate.
**Audience**: Urban Lagos homeowners 25–45 + skilled artisans

---

## Typography

### Font Families
```css
/* Display / Headlines */
--font-display: 'Cabinet Grotesk', sans-serif;

/* Body / UI */
--font-body: 'Satoshi', sans-serif;

/* Monospace (prices, numbers) */
--font-mono: 'JetBrains Mono', monospace;
```

### Font Scale
```css
--text-xs:   0.75rem;   /* 12px — labels, legal */
--text-sm:   0.875rem;  /* 14px — captions, meta */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — lead text */
--text-xl:   1.25rem;   /* 20px — card titles */
--text-2xl:  1.5rem;    /* 24px — section subheads */
--text-3xl:  1.875rem;  /* 30px — section headlines */
--text-4xl:  2.25rem;   /* 36px — page headlines */
--text-5xl:  3rem;      /* 48px — hero headline */
--text-6xl:  3.75rem;   /* 60px — hero display */
```

### Font Weights
```css
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

---

|

---

## Spacing Scale
```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### Section Padding
```css
/* Desktop */
--section-py: 6rem;   /* 96px top/bottom */
--section-px: 5rem;   /* 80px left/right */

/* Mobile */
--section-py-mobile: 4rem;
--section-px-mobile: 1.5rem;
```

---

## Border Radius
```css
--radius-sm:   0.375rem;  /* 6px — tags, badges */
--radius-md:   0.5rem;    /* 8px — inputs, small cards */
--radius-lg:   0.75rem;   /* 12px — cards */
--radius-xl:   1rem;      /* 16px — large cards */
--radius-2xl:  1.5rem;    /* 24px — modals, hero cards */
--radius-full: 9999px;    /* pills, avatars */
```

---

## Shadows
```css
--shadow-sm:  0 1px 3px rgba(26,26,46,0.08);
--shadow-md:  0 4px 16px rgba(26,26,46,0.12);
--shadow-lg:  0 8px 32px rgba(26,26,46,0.16);
--shadow-xl:  0 16px 48px rgba(26,26,46,0.20);
```

---

## Components

### Buttons
```css
/* Primary */
.btn-primary {
  background: var(--color-accent-500);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-full);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
}

/* Secondary (outlined) */
.btn-secondary {
  background: transparent;
  border: 1.5px solid var(--color-navy-900);
  color: var(--color-navy-900);
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-full);
}

/* Dark (nav CTA) */
.btn-dark {
  background: var(--color-navy-900);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-full);
}
```

### Eyebrow Label
```css
.eyebrow {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent-500);
}
```

### Verified Badge
```css
.verified-badge {
  background: #DCFCE7;
  color: var(--color-success);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

### Service Card
```css
.service-card {
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  background: white;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-neutral-100);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.service-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Active state */
.service-card--active {
  background: var(--color-navy-900);
  color: white;
}
```

### Input Fields
```css
.input {
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: var(--text-base);
  color: var(--color-navy-900);
  background: white;
  width: 100%;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--color-accent-500);
  outline: none;
  box-shadow: 0 0 0 3px rgba(233,69,96,0.1);
}
```

---

## Iconography
- **Library**: Lucide React
- **Size**: 16px (inline), 20px (UI), 24px (feature icons)
- **Stroke width**: 1.5px
- **Colour**: Inherits from parent text colour

---

## Image Guidelines
- **Provider photos**: 400×400px minimum, square crop, friendly expression
- **Service photos**: 16:9 ratio, well-lit, real Nigerian home environments
- **Hero mosaic**: 6 images at varying heights (see hero spec)
- **Format**: WebP with JPEG fallback
- **Loading**: Always use `next/image` with lazy loading

---

## Motion & Animation
```css
/* Transitions */
--transition-fast:   150ms ease;
--transition-base:   200ms ease;
--transition-slow:   300ms ease;

/* Hover lift */
transform: translateY(-2px);
transition: transform var(--transition-base);

/* Fade in (page load) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Breakpoints
```css
--screen-sm:  640px;   /* Mobile landscape */
--screen-md:  768px;   /* Tablet */
--screen-lg:  1024px;  /* Desktop */
--screen-xl:  1280px;  /* Wide desktop */
--screen-2xl: 1536px;  /* Ultra wide */
```

---

## Grid System
```css
/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-8);
}

/* Grid */
--grid-cols-12: repeat(12, 1fr);
--grid-gap: var(--space-6);
```

---

## Do's and Don'ts

### Do
- Use Cabinet Grotesk for all headlines
- Use accent red sparingly — CTAs, eyebrows, verified badges only
- Keep copy short and direct — Nigerian users scan, not read
- Always show ₦ prices in a monospace font
- Use real Lagos neighbourhood names in UI copy

### Don't
- Don't use Inter or Roboto — too generic
- Don't use purple — it's not our brand
- Don't use gradients on text
- Don't show empty states without a CTA
- Don't use placeholder lorem ipsum in production screens
