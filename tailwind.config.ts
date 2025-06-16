
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'], // Using Inter for consistency
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'subtle-pulse': { // Adjusted for more visibility
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.05)' },
        },
        'glow': { // Can be used for text or borders
          '0%, 100%': { filter: 'brightness(1)', opacity: '0.8' },
          '50%': { filter: 'brightness(1.5)', opacity: '1' },
        },
        'orbit': { // NEXUS inspired orbit
          'from': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          'to': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'fadeIn': { // Simple fade-in
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fadeInUp': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
         'background-pan': { // For animated gradient background
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'spin-slow': { // Added from Luxury homepage, keep for GameNexusBackground if needed
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'spin-slowest': { // From Luxury homepage, keep for GameNexusBackground
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'subtle-pulse': 'subtle-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'orbit': 'orbit 20s linear infinite',
        'fadeIn': 'fadeIn 1s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards', // Duration can be adjusted
        'background-pan': 'background-pan 15s ease infinite',
        'spin-slow': 'spin-slow 20s linear infinite', 
        'spin-slowest': 'spin-slowest 120s linear infinite',
      },
      boxShadow: { // Enhanced shadows for dark theme
        'accent-glow-sm': '0 0 10px 1px hsl(var(--accent) / 0.6)',
        'accent-glow-md': '0 0 20px 3px hsl(var(--accent) / 0.7)',
        'primary-glow-sm': '0 0 10px 1px hsl(var(--primary) / 0.6)',
        'primary-glow-md': '0 0 20px 3px hsl(var(--primary) / 0.7)',
        'card-deep': '0 10px 30px -5px hsl(var(--background) / 0.6), 0 8px 15px -8px hsl(var(--background) / 0.8)',
        'epic-depth': '0 15px 35px -10px hsl(var(--background) / 0.7), 0 10px 20px -12px hsl(var(--background) / 0.9)', // From Luxury Home
        'inner-soft-gold': 'inset 0 2px 4px 0 hsl(var(--accent) / 0.1), inset 0 -1px 2px 0 hsl(var(--background) / 0.3)', // From Luxury Home
      },
      backgroundImage: { // For gradients
        'nexus-gradient-main': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.3) 50%, hsl(var(--background)) 100%)',
        'nexus-gradient-hero': 'radial-gradient(ellipse at bottom, hsl(var(--primary)/0.3) 0%, transparent 60%)',
      },
       backgroundSize: { // For background-pan animation
        '200%': '200% 200%',
      },
      animationDelay: { // Explicit animationDelay in theme.extend
        '0s': '0s',
        '0.1s': '0.1s', '0.2s': '0.2s', '0.3s': '0.3s', '0.4s': '0.4s', '0.5s': '0.5s',
        '0.6s': '0.6s', '0.7s': '0.7s', '0.8s': '0.8s', '0.9s': '0.9s',
        '1s': '1s', '1.1s': '1.1s', '1.2s': '1.2s', '1.3s': '1.3s', '1.4s': '1.4s',
        '1.5s': '1.5s', '1.6s': '1.6s', '2s':'2s'
      },
      rotate: { // From Luxury homepage, keep for potential future use
        'y-10': 'rotateY(10deg)',
        'y-15': 'rotateY(15deg)',
        'x-3': 'rotateX(3deg)',
        'x-5': 'rotateX(5deg)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities, theme }: { addUtilities: any, theme: any }) {
      const newUtilities: {[key: string]: any} = {
        '.perspective-1000': { perspective: '1000px' },
        '.transform-style-preserve-3d': { 'transform-style': 'preserve-3d' },
      };
      const animationDelays = theme('animationDelay');
      if (animationDelays) {
        Object.entries(animationDelays).forEach(([key, value]) => {
          newUtilities[`.animation-delay-\\[${key}\\]`] = { 'animation-delay': value as string };
        });
      }
      const animationDurations = theme('animationDuration'); 
      if (animationDurations) {
        Object.entries(animationDurations).forEach(([key, value]) => {
          newUtilities[`.animation-duration-\\[${key}\\]`] = { 'animation-duration': value as string };
        });
      }
      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ],
} satisfies Config;
    
