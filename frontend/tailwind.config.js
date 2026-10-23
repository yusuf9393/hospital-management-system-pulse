/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Pulse" palette — clinical trust, not the generic cream/terracotta AI look.
        ink: "#0B1E2D",        // near-black navy for text
        surface: "#F7FAFA",    // cool clinical white
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#0F6E6A",  // deep teal — trust, calm, medical without being sterile
          light: "#14958F",
          dark: "#0A4F4C"
        },
        pulse: "#FF5D5D",      // vital-sign accent red, used sparingly (alerts, heartbeat motif)
        amber: "#E8A23D",      // pending/warning states
        line: "#E2E8E7"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.4)' }
        }
      },
      animation: {
        heartbeat: 'heartbeat 1.2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
