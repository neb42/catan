# Component Library Guide

Implementation guide for building Catan Online UI components in React with the Playful Geometry design system.

## Setup

### 1. Install Fonts

Add to `apps/web/index.html` in the `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Righteous&display=swap" rel="stylesheet">
```

### 2. Create Theme CSS

Create `apps/web/src/styles/theme.css`:

```css
:root {
  /* Colors */
  --color-primary: #FF6B9D;
  --color-secondary: #4ECDC4;
  --color-accent: #FFE66D;

  --color-player-red: #FF4757;
  --color-player-blue: #5F27CD;
  --color-player-green: #10AC84;
  --color-player-yellow: #FFB142;
  --color-player-purple: #9B59B6;
  --color-player-orange: #FF6348;

  --color-bg-base: #1A1A2E;
  --color-bg-surface: #252541;
  --color-bg-elevated: #2E2E4D;

  --color-success: #26DE81;
  --color-warning: #FED330;
  --color-error: #FC5C65;

  --color-text-primary: #F8F9FA;
  --color-text-secondary: #B8B9C0;
  --color-text-muted: #6B6C7A;

  --color-glow-primary: rgba(255, 107, 157, 0.4);
  --color-glow-secondary: rgba(78, 205, 196, 0.4);

  /* Spacing */
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

  /* Animation */
  --ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --duration-reveal: 600ms;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.16);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.24);
  --shadow-glow: 0 0 24px var(--color-glow-primary);

  /* Typography */
  --font-display: 'Righteous', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}

body {
  font-family: var(--font-body);
  background: var(--color-bg-base);
  color: var(--color-text-primary);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Import in `apps/web/src/main.tsx`:

```tsx
import './styles/theme.css';
```

---

## Core Components

### 1. Animated Background

**File:** `apps/web/src/components/AnimatedBackground.tsx`

```tsx
import { CSSProperties } from 'react';
import './AnimatedBackground.css';

export function AnimatedBackground() {
  return (
    <div className="animated-background">
      <div className="gradient-mesh" />
      <div className="geometric-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>
    </div>
  );
}
```

**File:** `apps/web/src/components/AnimatedBackground.css`

```css
.animated-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 157, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(78, 205, 196, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 230, 109, 0.08) 0%, transparent 60%);
  animation: mesh-float 20s ease-in-out infinite;
}

@keyframes mesh-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-5%, 5%) scale(1.05); }
}

.geometric-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  opacity: 0.06;
  animation: float-shape 15s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-lg);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: var(--color-secondary);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  top: 60%;
  right: 10%;
  animation-delay: 3s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  border: 3px solid var(--color-accent);
  border-radius: 50%;
  bottom: 15%;
  left: 15%;
  animation-delay: 6s;
}

@keyframes float-shape {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}
```

---

### 2. Player Card

**File:** `apps/web/src/components/PlayerCard.tsx`

```tsx
import { CSSProperties } from 'react';
import './PlayerCard.css';

interface PlayerCardProps {
  name: string;
  color: string;
  ready: boolean;
  isYou?: boolean;
  index?: number;
}

const PLAYER_COLORS: Record<string, string> = {
  red: '#FF4757',
  blue: '#5F27CD',
  green: '#10AC84',
  yellow: '#FFB142',
  purple: '#9B59B6',
  orange: '#FF6348',
};

export function PlayerCard({ name, color, ready, isYou = false, index = 0 }: PlayerCardProps) {
  const style = {
    '--player-color': PLAYER_COLORS[color],
    '--player-index': index,
  } as CSSProperties;

  return (
    <div className="player-card" style={style}>
      <div className="player-header">
        <div className="color-indicator" />
        <div className="player-name">{name}</div>
        {ready && <div className="ready-badge">Ready</div>}
      </div>
      {isYou && <div className="player-you">You</div>}
    </div>
  );
}
```

**File:** `apps/web/src/components/PlayerCard.css`

```css
.player-card {
  position: relative;
  padding: var(--space-lg);
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--player-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-base) var(--ease-smooth);
  animation: player-enter 0.4s var(--ease-bounce) backwards;
  animation-delay: calc(var(--player-index) * 0.1s);
}

@keyframes player-enter {
  from {
    opacity: 0;
    transform: translateX(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.player-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.player-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.color-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--player-color);
  box-shadow: 0 0 16px var(--player-color);
  flex-shrink: 0;
}

.player-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  flex: 1;
}

.ready-badge {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-success);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: badge-pop 0.3s var(--ease-bounce);
}

@keyframes badge-pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.player-you {
  font-size: 0.75rem;
  color: var(--color-accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

### 3. Color Selector

**File:** `apps/web/src/components/ColorSelector.tsx`

```tsx
import { CSSProperties } from 'react';
import './ColorSelector.css';

interface ColorSelectorProps {
  selectedColor: string;
  disabledColors?: string[];
  onColorSelect: (color: string) => void;
}

const COLORS = [
  { id: 'red', value: '#FF4757' },
  { id: 'blue', value: '#5F27CD' },
  { id: 'green', value: '#10AC84' },
  { id: 'yellow', value: '#FFB142' },
];

export function ColorSelector({
  selectedColor,
  disabledColors = [],
  onColorSelect,
}: ColorSelectorProps) {
  return (
    <div className="color-selector">
      <label className="color-label">Choose your color</label>
      <div className="color-grid">
        {COLORS.map((color) => {
          const isSelected = color.id === selectedColor;
          const isDisabled = disabledColors.includes(color.id);

          return (
            <button
              key={color.id}
              className={`color-option ${isSelected ? 'selected' : ''} ${
                isDisabled ? 'disabled' : ''
              }`}
              style={{ '--swatch-color': color.value } as CSSProperties}
              onClick={() => !isDisabled && onColorSelect(color.id)}
              disabled={isDisabled}
              aria-label={`Select ${color.id} color`}
            >
              {isDisabled && <span className="lock-icon">🔒</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**File:** `apps/web/src/components/ColorSelector.css`

```css
.color-selector {
  margin-bottom: var(--space-2xl);
}

.color-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  font-weight: 600;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.color-option {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--swatch-color);
  border: 3px solid transparent;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
  position: relative;
  padding: 0;
}

.color-option:hover:not(.selected):not(.disabled) {
  transform: scale(1.15);
  box-shadow: 0 0 24px var(--swatch-color);
}

.color-option.selected {
  border-color: white;
  transform: scale(1.2);
  box-shadow: 0 0 32px var(--swatch-color);
  animation: color-select 0.3s var(--ease-bounce);
}

@keyframes color-select {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.2); }
}

.color-option.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lock-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
```

---

### 4. Ready Button

**File:** `apps/web/src/components/ReadyButton.tsx`

```tsx
import './ReadyButton.css';

interface ReadyButtonProps {
  isReady: boolean;
  disabled?: boolean;
  pulse?: boolean;
  onClick: () => void;
}

export function ReadyButton({ isReady, disabled = false, pulse = false, onClick }: ReadyButtonProps) {
  return (
    <button
      className={`ready-button ${isReady ? 'active' : ''} ${pulse ? 'pulse-ready' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {isReady ? 'Not Ready' : 'Ready'}
    </button>
  );
}
```

**File:** `apps/web/src/components/ReadyButton.css`

```css
.ready-button {
  width: 100%;
  padding: var(--space-lg) var(--space-xl);
  font-family: var(--font-body);
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
  background: linear-gradient(135deg, var(--color-success) 0%, #1abc9c 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(38, 222, 129, 0.3);
}

.ready-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(38, 222, 129, 0.5);
}

.ready-button:active:not(:disabled) {
  transform: translateY(-1px);
}

.ready-button.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, #e74c3c 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.3);
}

.ready-button.active:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(255, 107, 157, 0.5);
}

.ready-button.pulse-ready {
  animation: pulse-ready 1s ease-in-out infinite;
}

@keyframes pulse-ready {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(38, 222, 129, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 32px rgba(38, 222, 129, 0.6);
    transform: scale(1.02);
  }
}

.ready-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

---

### 5. Countdown Modal

**File:** `apps/web/src/components/CountdownModal.tsx`

```tsx
import { useEffect, useState } from 'react';
import './CountdownModal.css';

interface CountdownModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onComplete: () => void;
  startFrom?: number;
}

export function CountdownModal({
  isVisible,
  onCancel,
  onComplete,
  startFrom = 10,
}: CountdownModalProps) {
  const [count, setCount] = useState(startFrom);

  useEffect(() => {
    if (!isVisible) {
      setCount(startFrom);
      return;
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, startFrom, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="countdown-modal">
      <div className="countdown-content">
        <div className="countdown-timer">
          <div className="countdown-circle">
            <div className="countdown-number" key={count}>
              {count}
            </div>
          </div>
        </div>
        <p className="countdown-text">Game starting soon...</p>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
```

**File:** `apps/web/src/components/CountdownModal.css`

```css
.countdown-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modal-fade-in 0.3s var(--ease-smooth);
}

@keyframes modal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.countdown-content {
  text-align: center;
  animation: countdown-enter 0.5s var(--ease-bounce);
}

@keyframes countdown-enter {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.countdown-timer {
  position: relative;
  width: 240px;
  height: 240px;
  margin: 0 auto var(--space-xl);
}

.countdown-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  border: 8px solid var(--color-primary);
  box-shadow: 0 0 64px rgba(255, 107, 157, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: circle-pulse 1s ease-in-out infinite;
}

@keyframes circle-pulse {
  0%, 100% { box-shadow: 0 0 32px rgba(255, 107, 157, 0.6); }
  50% { box-shadow: 0 0 64px rgba(255, 107, 157, 0.9); }
}

.countdown-number {
  font-family: var(--font-display);
  font-size: 6rem;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: number-tick 1s var(--ease-bounce);
}

@keyframes number-tick {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.countdown-text {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--space-xl);
  color: var(--color-text-secondary);
}

.cancel-button {
  padding: var(--space-md) var(--space-2xl);
  background: var(--color-bg-surface);
  border: 2px solid var(--color-text-muted);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
}

.cancel-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
}
```

---

## Usage Example

### Landing Page Route

```tsx
// apps/web/src/routes/index.tsx
import { useState } from 'react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import './landing.css';

export default function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    // Join lobby logic here
    console.log('Joining with nickname:', nickname);
  };

  return (
    <>
      <AnimatedBackground />
      <div className="landing-container">
        <h1 className="landing-title">Join the Game</h1>
        <p className="landing-subtitle">Enter your nickname to get started</p>

        <form onSubmit={handleSubmit} className="landing-form">
          <input
            type="text"
            className={`landing-input ${error ? 'error' : ''}`}
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError('');
            }}
            maxLength={20}
            autoFocus
          />
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="landing-button">
            Enter Lobby
          </button>
        </form>
      </div>
    </>
  );
}
```

### Lobby Page Route

```tsx
// apps/web/src/routes/lobby.tsx
import { useState } from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { ColorSelector } from '../components/ColorSelector';
import { ReadyButton } from '../components/ReadyButton';
import { CountdownModal } from '../components/CountdownModal';

export default function LobbyPage() {
  const [selectedColor, setSelectedColor] = useState('red');
  const [isReady, setIsReady] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  // Mock data - replace with WebSocket state
  const players = [
    { name: 'You', color: selectedColor, ready: isReady, isYou: true },
    { name: 'Alice', color: 'blue', ready: true, isYou: false },
    { name: 'Bob', color: 'green', ready: false, isYou: false },
  ];

  const usedColors = players.filter(p => !p.isYou).map(p => p.color);
  const allReady = players.every(p => p.ready);

  const handleToggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);

    if (newReadyState && allReady) {
      setShowCountdown(true);
    }
  };

  return (
    <div className="lobby-container">
      <div className="players-section">
        <h2>Players ({players.length}/4)</h2>
        {players.map((player, index) => (
          <PlayerCard key={player.name} {...player} index={index} />
        ))}
      </div>

      <div className="controls-section">
        <ColorSelector
          selectedColor={selectedColor}
          disabledColors={usedColors}
          onColorSelect={setSelectedColor}
        />
        <ReadyButton
          isReady={isReady}
          disabled={players.length < 3}
          pulse={!isReady && players.filter(p => p.ready).length === players.length - 1}
          onClick={handleToggleReady}
        />
      </div>

      <CountdownModal
        isVisible={showCountdown}
        onCancel={() => {
          setShowCountdown(false);
          setIsReady(false);
        }}
        onComplete={() => {
          console.log('Starting game!');
        }}
      />
    </div>
  );
}
```

---

## Accessibility Checklist

- Focus states visible on all interactive elements
- Color not sole indicator (icons + text labels)
- ARIA labels on icon-only buttons
- Keyboard navigation support (Tab, Enter, Escape)
- Respects `prefers-reduced-motion`
- Sufficient color contrast (4.5:1 for text)
- Semantic HTML structure

---

## Performance Tips

1. **CSS-only animations** - No JavaScript for motion
2. **Font preloading** - Use `rel="preconnect"` for Google Fonts
3. **Lazy load backgrounds** - Only render on landing/lobby pages
4. **Memoize components** - Use `React.memo` for player cards
5. **Debounce inputs** - Prevent excessive WebSocket messages

---

*Last updated: 2026-01-18 for v0.1 Lobby milestone*
