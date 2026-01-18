/**
 * AnimatedBackground - Full-screen animated geometric background
 *
 * Displays gradient mesh and floating geometric shapes with CSS animations.
 * Used on landing page for visual interest without JavaScript animation loops.
 *
 * Features:
 * - Fixed position full-screen background layer
 * - Gradient mesh with radial gradients
 * - Floating geometric shapes with CSS animations
 * - Respects prefers-reduced-motion media query
 */

import './AnimatedBackground.css';

export function AnimatedBackground() {
  return (
    <div className="animated-background">
      <div className="gradient-mesh"></div>
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
        <div className="shape shape-7"></div>
        <div className="shape shape-8"></div>
      </div>
    </div>
  );
}
