# Catan Online Design System

## Design Concept: "Playful Geometry"

A vibrant, geometric design language inspired by mid-century board game aesthetics mixed with contemporary digital playfulness. Think colorful plastic game pieces, clean shapes, and friendly interactions—NOT the medieval/rustic Settlers of Catan aesthetic.

### Core Philosophy
- **Approachable**: Feels like gathering around a table with friends
- **Energetic**: Bold colors and motion that create excitement
- **Clear**: Information hierarchy that never confuses
- **Tactile**: Interactions feel responsive and physical

---

## Typography

### Primary Font: "DM Sans"
**Display & UI**: DM Sans (Google Fonts)
- Modern geometric sans with friendly curves
- Weight range: 400 (Regular), 500 (Medium), 700 (Bold)
- Used for: UI elements, buttons, labels, body text

### Accent Font: "Righteous"
**Headlines & Key Moments**: Righteous (Google Fonts)
- Chunky, playful display font with personality
- Weight: 400 (single weight)
- Used for: Page titles, player names, countdown timer

**Why these fonts?**
- DM Sans: Clean, readable, approachable—avoids both corporate stiffness and handwritten clichés
- Righteous: Fun and bold without being childish, gives personality to key moments

---

## Color System

### Theme: "Game Night Neon"
A punchy palette with vibrant primaries and deep backgrounds—think colorful board game pieces on a dark table.

```css
:root {
  /* Core Brand Colors */
  --color-primary: #FF6B9D;        /* Hot pink - energetic, friendly */
  --color-secondary: #4ECDC4;      /* Bright teal - fresh, inviting */
  --color-accent: #FFE66D;         /* Sunny yellow - optimistic highlight */

  /* Player Colors (bold and distinct) */
  --color-player-red: #FF4757;
  --color-player-blue: #5F27CD;
  --color-player-green: #10AC84;
  --color-player-yellow: #FFB142;
  --color-player-purple: #9B59B6;
  --color-player-orange: #FF6348;

  /* Background Layers */
  --color-bg-base: #1A1A2E;        /* Deep navy - sophisticated dark */
  --color-bg-surface: #252541;     /* Mid purple-navy - elevated surfaces */
  --color-bg-elevated: #2E2E4D;    /* Lighter purple - cards/modals */

  /* Semantic Colors */
  --color-success: #26DE81;        /* Bright green */
  --color-warning: #FED330;        /* Warm yellow */
  --color-error: #FC5C65;          /* Soft red */

  /* Text */
  --color-text-primary: #F8F9FA;   /* Near white */
  --color-text-secondary: #B8B9C0; /* Muted gray */
  --color-text-muted: #6B6C7A;     /* Subtle gray */

  /* Effects */
  --color-glow-primary: rgba(255, 107, 157, 0.4);
  --color-glow-secondary: rgba(78, 205, 196, 0.4);
}
```

**Color Strategy:**
- Dark backgrounds let vibrant colors pop
- High contrast ensures accessibility
- Each player color is immediately distinguishable
- Glows add depth without clutter

---

## Spatial System

### Grid & Spacing
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Generous spacing for breathing room */
  --container-max: 1200px;
  --content-padding: var(--space-xl);
}
```

### Layout Principles
- **Generous whitespace**: Let content breathe
- **Card-based surfaces**: Elevated panels with subtle shadows
- **Asymmetric balance**: Avoid centered columns—use 2/3 + 1/3 splits
- **Diagonal flow**: Subtle rotations and skewed elements add energy

---

## Motion Design

### Animation Philosophy
High-impact moments with CSS-only animations. Focus on:
1. **Page load orchestration** - Staggered reveals
2. **State transitions** - Ready states, countdown
3. **Micro-interactions** - Hover, click feedback

### Core Animations
```css
/* Timing functions */
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Durations */
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
--duration-reveal: 600ms;
```

**Key Animations:**
1. **Slide-up reveals**: Content enters from bottom with fade
2. **Scale pops**: Buttons/cards scale on interaction
3. **Glow pulses**: Ready states have subtle pulsing glows
4. **Number countdowns**: Countdown timer scales + rotates each second

---

## Component Patterns

### Landing Page
**Layout**: Full-screen centered with animated background pattern

**Elements:**
- Hero title (Righteous, huge)
- Nickname input (large, friendly, auto-focused)
- Animated geometric pattern background (CSS)
- Validation feedback appears inline

**Interaction:**
- Input grows on focus
- Submit button pulses when valid nickname entered
- Error messages slide in from side

---

### Lobby Screen
**Layout**: Asymmetric split
- Left 60%: Player list (large cards)
- Right 40%: Color selector + controls

**Player Cards:**
- Large elevated cards with player color accent
- Status indicators: color dot + "Ready" badge
- Stagger-animate on join

**Color Selector:**
- Grid of circular color swatches
- Selected color has ring + scale effect
- Unavailable colors are dimmed + locked icon

**Ready System:**
- Giant "READY" button (changes to "NOT READY" when active)
- Pulses when everyone else is ready
- Countdown appears as modal overlay with animated number

---

### Countdown Modal
**Visual:**
- Full-screen dark overlay (backdrop blur)
- Giant circular countdown timer (center)
- Number scales + rotates each second
- Progress ring around number

**Interaction:**
- Click outside or "Cancel" to un-ready
- Final second triggers green flash

---

## Visual Effects

### Backgrounds
**Landing:**
- Animated geometric grid with gradient overlays
- Subtle floating shapes (CSS triangles, circles)
- Mesh gradient backdrop

**Lobby:**
- Darker solid with subtle noise texture
- Radial gradient spotlight on player area
- Floating particles (optional, CSS only)

### Shadows & Depth
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.12);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.16);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.24);
--shadow-glow: 0 0 24px var(--color-glow-primary);
```

### Hover States
- Scale: 1.05
- Shadow increase
- Color brightening (+10% lightness)
- Smooth transition (--duration-base)

---

## Accessibility

### Contrast Ratios
- Text on dark bg: 4.5:1 minimum (WCAG AA)
- Interactive elements: Clear focus states
- Color not sole indicator: Icons + text labels

### Motion
- Respect `prefers-reduced-motion`
- Fallback to instant transitions
- No essential information conveyed only through motion

### Focus Management
- Visible focus rings (3px solid accent color)
- Logical tab order
- Escape key to dismiss modals

---

## Implementation Notes

### Font Loading
```html
<!-- In index.html head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Righteous&display=swap" rel="stylesheet">
```

### CSS Architecture
1. `theme.css` - CSS variables (colors, spacing, timing)
2. `animations.css` - Keyframes and animation utilities
3. `components/*.css` - Component-specific styles

### Mantine Integration
- Override Mantine theme with custom colors
- Use Mantine components as base, apply custom styles
- Preserve Mantine accessibility features

---

## Design Deliverables

1. **Landing Page Mockup** (HTML/CSS demo)
2. **Lobby Screen Mockup** (HTML/CSS demo)
3. **Component Library Snippet** (Reusable React components with styles)
4. **Animation Showcase** (Interactive demo of key animations)

---

*Last updated: 2026-01-18 for v0.1 Lobby milestone*
