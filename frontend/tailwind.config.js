/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chocolate: {
          50: '#fbf7f6',
          100: '#f5ebe8',
          200: '#eddcd6',
          300: '#e0c7be',
          400: '#cfad9f',
          500: '#b88d7d',
          600: '#a67261', // Original primary
          700: '#8c594a',
          800: '#754a3e', // Deep Chocolate
          900: '#5e3c32', // Darker
          950: '#2A1B18', // Ultra Dark (Backgrounds)
        },
        gold: {
          50: '#fbf9f0',
          100: '#f6f0db',
          200: '#ede0ba',
          300: '#e3cc91',
          400: '#dab366',
          500: '#cf9a3c', // Metallic Gold
          600: '#b57d2e', 
          700: '#946026',
          800: '#784c22',
          900: '#633e1f',
          950: '#38210e',
        },
        vibrant: {
          cream: '#FFFBEB',
          green: '#10b981',
          red: '#f43f5e',
          amber: '#f59e0b',
          blue: '#3b82f6',
        },
        industrial: {
          primary: '#6B3E26',   // Chocolate brown
          secondary: '#C69C6D', // Caramel gold
          accent: '#F2E6D8',    // Light cocoa
          background: '#FAF7F2',// Soft cream
          dark: '#2B1A12',      // Deep cocoa
          info: '#0288D1',      // Environmental monitoring (Blue)
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'chocolate-gradient': 'linear-gradient(135deg, #2A1B18 0%, #43302b 100%)',
        'gold-gradient': 'linear-gradient(135deg, #cf9a3c 0%, #b57d2e 100%)',
        'glass-dark': 'linear-gradient(180deg, rgba(42, 27, 24, 0.7) 0%, rgba(42, 27, 24, 0.4) 100%)',
        'glass-light': 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(207, 154, 60, 0.3)',
        'premium-in': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'premium-out': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleIn: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
