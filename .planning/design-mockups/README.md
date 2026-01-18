# Design Mockups

Interactive HTML mockups demonstrating the **Playful Geometry** design system for Catan Online.

## Design Philosophy

This design language is **fun, friendly, and energetic** while maintaining strong UX principles. It deliberately avoids the medieval/rustic aesthetic of Settlers of Catan in favor of a modern, geometric, board-game-inspired look.

### Key Design Decisions

**Typography:**
- **Righteous** (display font): Chunky, playful, memorable—perfect for player names and headlines
- **DM Sans** (UI font): Clean geometric sans that's approachable without being corporate

**Color Palette:**
- **Game Night Neon**: Vibrant primaries (hot pink, bright teal, sunny yellow) on deep navy backgrounds
- Player colors are bold and immediately distinguishable
- High contrast ensures accessibility while maintaining energy

**Motion Design:**
- CSS-only animations for performance
- Staggered reveals on page load create delight
- Micro-interactions on hover/click provide feedback
- Countdown timer has dramatic scale + rotate animation

**Spatial Design:**
- Generous whitespace lets content breathe
- Card-based elevated surfaces with subtle shadows
- Asymmetric layouts (60/40 split) add visual interest
- Floating geometric shapes create depth

---

## Files

### 1. `landing-page.html`
**Landing page with nickname entry**

**Features:**
- Animated geometric background with floating shapes
- Auto-focused input with grow-on-focus effect
- Inline validation with shake animation on error
- Button pulses when valid nickname entered
- Fully responsive layout

**Demo Controls:**
- Show Empty Error
- Show Taken Error
- Show Valid State
- Reset Form

**To view:** Open `landing-page.html` in a browser

---

### 2. `lobby-screen.html`
**Lobby with player list, color selector, and ready system**

**Features:**
- Player cards with stagger-enter animation
- Color selector with lock states for taken colors
- Ready badge pops in with bounce animation
- Giant ready button pulses when others are waiting
- Countdown modal with animated number tick
- Fully interactive demo

**Demo Controls:**
- Add Player (up to 4)
- Remove Player
- Toggle Ready
- Start Countdown
- Reset Demo

**To view:** Open `lobby-screen.html` in a browser

---

## Design System Documents

### `DESIGN-SYSTEM.md`
Complete design specification including:
- Typography system
- Color palette with CSS variables
- Spacing and layout principles
- Motion design philosophy
- Component patterns
- Accessibility guidelines

### `COMPONENT-LIBRARY.md`
Implementation guide with:
- React component code
- CSS modules
- Usage examples
- Integration with Mantine
- Performance tips
- Accessibility checklist

---

## How to Use These Mockups

### 1. Review the Design
Open both HTML files in your browser to experience the design interactively:

```bash
# From this directory
open landing-page.html
open lobby-screen.html
```

Use the demo controls (bottom-right corner) to test different states.

### 2. Extract What You Need
The mockups are self-contained HTML files with inline CSS. You can:

- Copy color variables to your theme
- Extract animations to your CSS
- Use component structures as references
- Test interactions before implementing

### 3. Implement in React
Follow the `COMPONENT-LIBRARY.md` guide to build production components:

1. Set up theme CSS variables
2. Install Google Fonts
3. Build reusable components (PlayerCard, ColorSelector, etc.)
4. Integrate with WebSocket state
5. Add accessibility features

---

## Design Highlights

### Landing Page
- **First Impression**: Bold gradient title with floating geometric shapes
- **Focus**: Large, friendly input field that grows on focus
- **Feedback**: Inline errors slide in from the left with shake animation
- **CTA**: Gradient button with shine effect on hover

### Lobby Screen
- **Information Hierarchy**: Player list dominates (60% width), controls are secondary
- **Player Cards**: Left-border color accent + glowing color dot
- **Color Selection**: Circular swatches with scale-on-hover, locked states for unavailable colors
- **Ready State**: Giant button changes color/text, pulses when everyone is waiting
- **Countdown**: Full-screen modal with animated circular timer

---

## Accessibility Features

All mockups include:
- ✅ High contrast text (WCAG AA compliant)
- ✅ Visible focus states
- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ `prefers-reduced-motion` support (in production CSS)

---

## Technical Notes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support needed
- CSS Grid and Custom Properties required
- Backdrop-filter for modal blur

### Performance
- Pure CSS animations (no JavaScript for motion)
- GPU-accelerated transforms
- Minimal DOM manipulation
- No external dependencies

### Fonts
Loaded from Google Fonts CDN:
- DM Sans (400, 500, 700)
- Righteous (400)

---

## Next Steps

1. **Review & Feedback**: Open mockups, test interactions, provide feedback
2. **Refine**: Adjust colors, spacing, animations based on feedback
3. **Implement**: Follow COMPONENT-LIBRARY.md to build React components
4. **Integrate**: Connect components to WebSocket state
5. **Test**: Verify accessibility, performance, cross-browser compatibility

---

*Created: 2026-01-18 for Catan Online v0.1 Lobby Milestone*
