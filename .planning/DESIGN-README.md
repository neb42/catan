# Catan Online Design Documentation

Complete design system and implementation guide for the **Playful Geometry** design language.

---

## 📁 Design Files Overview

### Core Documentation

| File | Purpose | Audience |
|------|---------|----------|
| **DESIGN-SYSTEM.md** | Complete design specification with colors, typography, spacing, motion | Designers & Developers |
| **DESIGN-RATIONALE.md** | Why we made these design choices, comparison to alternatives | Stakeholders & Team |
| **COMPONENT-LIBRARY.md** | React component implementation guide with code examples | Developers |

### Interactive Mockups

| File | Description | Interactive Demo |
|------|-------------|------------------|
| **design-mockups/landing-page.html** | Landing page with nickname entry | ✅ Yes - Open in browser |
| **design-mockups/lobby-screen.html** | Lobby with players, color selector, ready system | ✅ Yes - Open in browser |
| **design-mockups/README.md** | Guide to using the mockups | Documentation |

---

## 🚀 Quick Start

### 1. Review the Design

Open the interactive mockups to experience the design:

```bash
cd .planning/design-mockups
open landing-page.html
open lobby-screen.html
```

Use the **Demo Controls** (bottom-right) to test different states:
- Landing: Show errors, valid states
- Lobby: Add/remove players, toggle ready, start countdown

### 2. Read the Rationale

Understand the **why** behind the design:

```bash
open .planning/DESIGN-RATIONALE.md
```

Key points:
- Why NOT Settlers of Catan aesthetic
- Typography and color psychology
- UX decisions for each screen
- Accessibility considerations

### 3. Implement Components

Follow the step-by-step guide:

```bash
open .planning/COMPONENT-LIBRARY.md
```

Includes:
- React component code (TypeScript)
- CSS modules with animations
- Usage examples
- Integration with Mantine
- Accessibility checklist

### 4. Reference the Design System

Look up colors, spacing, animations:

```bash
open .planning/DESIGN-SYSTEM.md
```

Quick reference:
- CSS variables for theming
- Typography scale
- Color palette
- Animation timing functions
- Component patterns

---

## 🎨 Design Principles

### "Playful Geometry"

A vibrant, geometric design language that is:

**Fun & Friendly**
- Bold colors (hot pink, teal, yellow)
- Chunky display font (Righteous)
- Playful animations (bounces, scales, glows)

**Strong UX**
- Clear information hierarchy
- Immediate feedback on interactions
- Intuitive affordances (buttons look clickable)

**Distinctive**
- NOT medieval/rustic like Settlers
- NOT generic purple gradients
- NOT overused Inter font

---

## 🎯 Design System At a Glance

### Colors

```css
--color-primary: #FF6B9D;     /* Hot pink */
--color-secondary: #4ECDC4;   /* Bright teal */
--color-accent: #FFE66D;      /* Sunny yellow */
--color-bg-base: #1A1A2E;     /* Deep navy */
```

### Typography

```css
--font-display: 'Righteous';  /* Headlines, player names */
--font-body: 'DM Sans';       /* UI, body text */
```

### Spacing

```css
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### Animations

```css
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--duration-base: 250ms;
```

---

## 📐 Component Patterns

### Landing Page

**Layout:**
- Full-screen centered with animated background
- Hero title (Righteous, gradient)
- Large nickname input (auto-focus, grow on focus)
- Primary CTA button (gradient, pulse when valid)

**Interactions:**
- Input grows + glows on focus
- Error messages slide in from left
- Button pulses when ready to submit

---

### Lobby Screen

**Layout:**
- Asymmetric split: 60% players, 40% controls
- Header with logo + leave button
- Player cards (stagger-enter animation)
- Color selector grid
- Giant ready button

**Interactions:**
- Player cards slide in on join
- Color swatches scale on hover
- Ready badge pops in with bounce
- Button pulses when everyone waiting
- Countdown modal with animated number

---

## 🛠️ Implementation Checklist

### Phase 1: Setup
- [ ] Add Google Fonts to `index.html`
- [ ] Create `theme.css` with CSS variables
- [ ] Import theme in `main.tsx`
- [ ] Test font loading and variable access

### Phase 2: Landing Page
- [ ] Build `AnimatedBackground` component
- [ ] Create landing page route with form
- [ ] Add input validation
- [ ] Implement error states
- [ ] Test responsive layout

### Phase 3: Lobby Components
- [ ] Build `PlayerCard` component
- [ ] Build `ColorSelector` component
- [ ] Build `ReadyButton` component
- [ ] Build `CountdownModal` component
- [ ] Test stagger animations

### Phase 4: Lobby Page
- [ ] Create lobby route
- [ ] Integrate components
- [ ] Connect WebSocket state
- [ ] Test real-time updates
- [ ] Verify accessibility

### Phase 5: Polish
- [ ] Add focus management
- [ ] Test keyboard navigation
- [ ] Verify color contrast
- [ ] Test `prefers-reduced-motion`
- [ ] Cross-browser testing

---

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px) { /* Small tablets */ }
@media (min-width: 900px) { /* Tablets & desktops */ }
@media (min-width: 1200px) { /* Large desktops */ }
```

**Key Adaptations:**
- Lobby: Single column on mobile, split on desktop
- Player cards: Full width on mobile, fixed width on desktop
- Color grid: 2x2 on mobile, 4x1 on desktop

---

## ♿ Accessibility Standards

### WCAG AA Compliance

**Visual:**
- ✅ 4.5:1 minimum contrast ratio
- ✅ 24px+ font size for body text
- ✅ 44x44px minimum touch targets

**Interaction:**
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Visible focus states (3px rings)
- ✅ ARIA labels on icon buttons

**Motion:**
- ✅ Respects `prefers-reduced-motion`
- ✅ No essential information via motion only
- ✅ Cancellable time-based interactions

---

## 🔧 Development Tools

### Testing Mockups Locally

```bash
# Open landing page
open .planning/design-mockups/landing-page.html

# Open lobby screen
open .planning/design-mockups/lobby-screen.html
```

### Extracting CSS

All mockups use inline CSS. To extract:

1. Open browser DevTools
2. Copy `<style>` block
3. Paste into component CSS file
4. Replace hardcoded values with CSS variables

### Color Contrast Checker

Use browser DevTools:
1. Inspect text element
2. Open "Styles" panel
3. Check contrast ratio next to color value
4. Ensure 4.5:1 minimum

---

## 📚 Additional Resources

### Fonts
- [DM Sans on Google Fonts](https://fonts.google.com/specimen/DM+Sans)
- [Righteous on Google Fonts](https://fonts.google.com/specimen/Righteous)

### CSS Animations
- [MDN: Using CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations)
- [Easing Functions Cheat Sheet](https://easings.net/)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎭 Design Tokens

All design values are defined as CSS variables in `theme.css`:

```css
:root {
  /* Colors: --color-* */
  /* Spacing: --space-* */
  /* Border radius: --radius-* */
  /* Animations: --ease-*, --duration-* */
  /* Shadows: --shadow-* */
  /* Typography: --font-* */
}
```

**Benefits:**
- Consistent values across components
- Easy theming (light/dark mode in future)
- Single source of truth
- Type-safe with TypeScript CSS modules

---

## 🚦 Status

| Phase | Status | Notes |
|-------|--------|-------|
| Design Spec | ✅ Complete | DESIGN-SYSTEM.md |
| Design Rationale | ✅ Complete | DESIGN-RATIONALE.md |
| Landing Mockup | ✅ Complete | Interactive HTML |
| Lobby Mockup | ✅ Complete | Interactive HTML |
| Component Guide | ✅ Complete | React implementation |
| Implementation | ⏳ Pending | Ready to build |

---

## 🤝 Getting Help

### Questions About Design?

**What it looks like:** Open the mockups
**Why we made choices:** Read DESIGN-RATIONALE.md
**How to implement:** Follow COMPONENT-LIBRARY.md
**Where values come from:** Check DESIGN-SYSTEM.md

### Feedback Process

1. Open mockup in browser
2. Test interactions with demo controls
3. Note specific feedback (e.g., "button too small")
4. Share with team for discussion
5. Update design docs if changes approved

---

## 🎯 Next Steps

1. **Review mockups** - Experience the design interactively
2. **Read rationale** - Understand the decisions
3. **Setup theme** - Add fonts and CSS variables
4. **Build components** - Follow component library guide
5. **Integrate** - Connect to WebSocket state
6. **Test** - Verify accessibility and responsiveness

---

*Created: 2026-01-18 for Catan Online v0.1 Lobby Milestone*
*Design System: "Playful Geometry"*
*Status: Ready for Implementation*
