---
name: Summer Camp Social System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3f484e'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6f787e'
  outline-variant: '#bec8ce'
  surface-tint: '#006686'
  primary: '#006686'
  on-primary: '#ffffff'
  primary-container: '#7dd3fc'
  on-primary-container: '#005b78'
  inverse-primary: '#7bd1fa'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed01b'
  on-secondary-container: '#6f5900'
  tertiary: '#b4136d'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffb3cf'
  on-tertiary-container: '#a40062'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0e8ff'
  primary-fixed-dim: '#7bd1fa'
  on-primary-fixed: '#001e2b'
  on-primary-fixed-variant: '#004d66'
  secondary-fixed: '#ffe083'
  secondary-fixed-dim: '#eec200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
  summer-sky: '#7dd3fc'
  sunshine-yellow: '#facc15'
  vibrant-pink: '#ec4899'
  sunset-orange: '#fb923c'
  deep-slate: '#1e293b'
  cloud-white: '#ffffff'
typography:
  h1-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 48px
  h2-section:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-medium:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  caption-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin: 24px
---

# Summer Camp Social - Design System Documentation

## North Star: "Vibrant Summer Connection"
A high-energy, intuitive, and playful interface designed to bridge the gap between summer camp staff and parents. The system balances professional management tools with a fun, social media-inspired aesthetic.

## Visual Principles
- **Hyper-Colorful:** Bold, saturated colors that reflect the energy of a summer camp.
- **Modern & Airy:** Using whitespace and soft shadows to keep the dense information readable and light.
- **Engaging & Playful:** Incorporating rounded corners (12px-16px) and vibrant accents to create an approachable "gamified" feel.
- **Clarity over Complexity:** High contrast for key actions to ensure both busy staff and on-the-go parents can navigate with ease.

## Color Palette

### Primary Colors
- **Summer Sky (Sky Blue):** `#7dd3fc` - Used for primary actions, navigation backgrounds, and refreshing accents. Replaces the traditional "forest green" for a more modern feel.
- **Sunshine Yellow:** `#facc15` - Used for energy, highlights, and secondary interactive elements.
- **Vibrant Pink:** `#ec4899` - Our signature accent color. Used for high-priority CTAs, notifications, and "fun" social interactions.

### Secondary/Support Colors
- **Sunset Orange:** `#fb923c` - Used for alerts, progress bars, and warmth.
- **Deep Slate:** `#1e293b` - Primary typography color to ensure maximum readability against bright backgrounds.
- **Cloud White:** `#ffffff` - The base surface for cards and containers to maintain a clean look.

## Typography
- **Primary Font:** `Plus Jakarta Sans`
- **Scale:**
  - **H1 (Display):** 36px/48px, ExtraBold - For welcome messages and main headers.
  - **H2 (Section):** 24px/32px, Bold - For card titles and secondary headers.
  - **Body:** 16px/24px, Medium - For descriptions and general content.
  - **Caption:** 12px/16px, Bold - For tags, status labels, and small metadata.

## Components & Patterns

### 1. Navigation
- **Side Navigation:** Uses a fixed sidebar with a clear hierarchical structure. Active states are highlighted with bold backgrounds and high-contrast text.
- **Top Bar:** Houses global search and user profile/notifications for quick access.

### 2. Cards & Containers
- **Border Radius:** `16px` for main containers, `12px` for nested elements.
- **Shadows:** Soft, diffused shadows (`0 4px 20px -2px rgba(0,0,0,0.05)`) to create depth without clutter.
- **Glassmorphism:** Subtle background blurs on overlays to maintain context.

### 3. Interactive Elements
- **Buttons:** Large, rounded buttons with bold typography. Primary buttons use the Vibrant Pink (`#ec4899`) or Summer Sky (`#7dd3fc`).
- **Input Fields:** Clean, outlined fields with clear focus states using the Summer Sky color.
- **Status Tags:** Pills with saturated background colors and dark text for instant recognition (e.g., "Checked-in", "Active").

## Iconography
- **Style:** Outlined or solid Material Icons with consistent stroke weights.
- **Coloring:** Icons often take the primary or secondary color of their category (e.g., Pink for social, Sky Blue for management).


