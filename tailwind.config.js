/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette from DESIGN.md
        "summer-sky": "#7dd3fc",
        "sunshine-yellow": "#facc15",
        "vibrant-pink": "#ec4899",
        "sunset-orange": "#fb923c",
        "deep-slate": "#1e293b",
        "cloud-white": "#ffffff",
        
        // Surface Palette
        surface: "#f9f9ff",
        "surface-dim": "#cfdaf2",
        "surface-bright": "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
        
        // On Surface
        "on-surface": "#111c2d",
        "on-surface-variant": "#3f484e",
        outline: "#6f787e",
        "outline-variant": "#bec8ce",
        
        // Primary/Secondary from YAML
        primary: "#006686",
        "primary-container": "#7dd3fc",
        secondary: "#735c00",
        "secondary-container": "#fed01b",
        tertiary: "#b4136d",
        error: "#ba1a1a",
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px',
      },
      fontSize: {
        'h1-display': ['36px', { lineHeight: '48px', fontWeight: '800' }],
        'h2-section': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'body-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'caption-bold': ['12px', { lineHeight: '16px', fontWeight: '700' }],
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Heebo', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0,0,0,0.05)',
      },
      spacing: {
        unit: "4px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        gutter: "20px",
        margin: "24px",
      }
    },
  },
  plugins: [],
}
