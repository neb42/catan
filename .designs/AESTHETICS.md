<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!

# Catan Project Aesthetics: "Fun & Friendly"

## Core Philosophy
The design avoids the "generic SaaS" look and embraces a tactile, toy-like, and inviting atmosphere. It should feel like a modern, digital board game—not a spreadsheet.

-   **Tone**: Playful, Warm, clear, and Tactile.
-   **Keywords**: Soft, Rounded, Vibrant, Bouncy, Clean.

## Visual Language

### Typography
-   **Headings**: `Fredoka` (Google Fonts). Rounded, friendly, legible display font.
-   **Body**: `Nunito` (Google Fonts). Rounded sans-serif that pairs perfectly with Fredoka.
-   **Weight**: Lean towards semibold (500-700) for UI elements to maintain a "chunky" toy feel.

### Color Palette

**Backgrounds**
-   Main Background: `#E6F3F8` (Soft Sky Blue) or `#FFF8E1` (Warm Cream).
-   Panels/Cards: `#FFFFFF` (White) with opacity allow for backdrop blur if needed.

**Resources (Vibrant Pastels)**
-   **Wood**: `#66BB6A` (Soft Forest Green)
-   **Brick**: `#FF7043` (Terracotta/Orange)
-   **Sheep**: `#AED581` (Light Green)
-   **Wheat**: `#FDD835` (Sunshine Yellow)
-   **Ore**: `#90A4AE` (Blue Grey)
-   **Desert**: `#D7CCC8` (Soft Tan)

**UI Elements**
-   **Primary Action**: `#29B6F6` (Sky Blue) - Distinctive but not aggressive.
-   **Secondary/Warning**: `#FBC02D` (Yellow) or `#EF5350` (Soft Red).
-   **Text**: `#37474F` (Dark Blue Grey) - softer than pure black.

### UI Components

**Shapes & Borders**
-   **Border Radius**: Aggressive rounding. `16px` for cards, `24px` or `50px` (pill) for buttons.
-   **Shadows**: Soft, diffuse shadows (`0 8px 24px rgba(0,0,0,0.08)`).
-   **Buttons**: "3D" feel using `border-bottom` or stacked shadows to imply pressability.

**Interaction**
-   **Hover**: Elements should "lift" (`transform: translateY(-4px)`).
-   **Active**: Elements should "press" (`transform: translateY(2px)`).
-   **Animations**: Bouncy springs rather than linear eases.

### Hex Board
-   **Style**: Clean SVG shapes.
-   **Numbers**: Clear, high-contrast tokens.
-   **Pieces**: Simplified, iconic shapes (House, Church/City, Road) rather than realistic textures.
</frontend_aesthetics>
