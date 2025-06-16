
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
        'ember-float': {
          '0%': { transform: 'translateY(0) translateX(0) scale(0.5)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { transform: 'translateY(-100vh) translateX(calc(var(--tw-translate-x, 0px) + (sin(var(--animation-progress,0)*2*3.14159)*30px))) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-120vh) translateX(calc(var(--tw-translate-x,0px) + (sin(var(--animation-progress,1)*2*3.14159)*30px))) scale(0.5)', opacity: '0' },
        },
        'fog-drift': {
          '0%': { transform: 'translateX(-10%) translateY(-5%) scale(1)' },
          '50%': { transform: 'translateX(10%) translateY(5%) scale(1.05)' },
          '100%': { transform: 'translateX(-10%) translateY(-5%) scale(1)' },
        },
        'ping-slow': { // For subtle background element pulsing
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.5' },
        },
        'float-rotate-3d': {
          '0%': {
            transform: 'translateZ(var(--start-z, 0px)) rotateX(var(--start-rotateX, 0deg)) rotateY(var(--start-rotateY, 0deg)) translateY(0px) scale(1)',
            opacity: 'var(--start-opacity, 0.3)',
          },
          '50%': {
            transform: 'translateZ(calc(var(--start-z, 0px) + 20px)) rotateX(calc(var(--start-rotateX, 0deg) + 20deg)) rotateY(calc(var(--start-rotateY, 0deg) + 30deg)) translateY(-20px) scale(1.05)',
            opacity: 'calc(var(--start-opacity, 0.3) + 0.2)',
          },
          '100%': {
            transform: 'translateZ(var(--start-z, 0px)) rotateX(var(--start-rotateX, 0deg)) rotateY(var(--start-rotateY, 0deg)) translateY(0px) scale(1)',
            opacity: 'var(--start-opacity, 0.3)',
          },
        },
        'sparkle': {
          '0%, 100%': { opacity: 'var(--start-opacity, 0.3)', transform: 'scale(0.8)' },
          '50%': { opacity: 'calc(var(--start-opacity, 0.3) + 0.5)', transform: 'scale(1.2)', boxShadow: '0 0 10px 2px hsl(var(--accent)/0.8)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'subtle-pulse': 'subtle-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'orbit': 'orbit 20s linear infinite',
        'fadeIn': 'fadeIn 1s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
        'background-pan': 'background-pan 15s ease infinite',
        'ember-float': 'ember-float linear infinite', 
        'fog-drift': 'fog-drift 60s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'spin-slowest': 'spin 120s linear infinite',
        'ping-slow': 'ping-slow 5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-rotate-3d': 'float-rotate-3d ease-in-out infinite', // Added
        'sparkle': 'sparkle ease-in-out infinite', // Added
      },
      boxShadow: { // Enhanced shadows for dark theme
        'accent-glow-sm': '0 0 10px 1px hsl(var(--accent) / 0.6)',
        'accent-glow-md': '0 0 20px 3px hsl(var(--accent) / 0.7)',
        'primary-glow-sm': '0 0 10px 1px hsl(var(--primary) / 0.6)',
        'primary-glow-md': '0 0 20px 3px hsl(var(--primary) / 0.7)',
        'card-deep': '0 10px 30px -5px hsl(var(--background) / 0.6), 0 8px 15px -8px hsl(var(--background) / 0.8)',
        'epic-depth': '0 15px 35px -10px hsl(var(--background) / 0.7), 0 10px 20px -12px hsl(var(--background) / 0.9)',
        'inner-soft-gold': 'inset 0 2px 4px 0 hsl(var(--accent) / 0.1), inset 0 -1px 2px 0 hsl(var(--background) / 0.3)', // New
      },
      backgroundImage: { // For gradients
        'nexus-gradient-main': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.3) 50%, hsl(var(--background)) 100%)',
        'nexus-gradient-hero': 'radial-gradient(ellipse at bottom, hsl(var(--primary)/0.3) 0%, transparent 60%)',
      },
       backgroundSize: { // For background-pan animation
        '200%': '200% 200%',
      },
      animationDelay: { // Added custom animation delay utilities
        '0.1s': '0.1s', '0.4s': '0.4s', '0.6s': '0.6s', '0.8s': '0.8s',
        '1.0s': '1.0s', '1.2s': '1.2s', '1.4s': '1.4s', '1.6s': '1.6s',
      },
      rotate: { // Added for 3D transforms if needed via Tailwind class
        'y-10': 'rotateY(10deg)',
        'y-15': 'rotateY(15deg)',
        'x-3': 'rotateX(3deg)',
        'x-5': 'rotateX(5deg)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.perspective-1000': { perspective: '1000px' }, // Utility for perspective
        '.transform-style-preserve-3d': { 'transform-style': 'preserve-3d' }, // Utility for transform-style

        '.animation-delay-none': { animationDelay: '0s' },
        '.animation-delay-100': { animationDelay: '100ms' },
        '.animation-delay-200': { animationDelay: '200ms' },
        '.animation-delay-300': { animationDelay: '300ms' },
        '.animation-delay-500': { animationDelay: '500ms' },
        '.animation-delay-700': { animationDelay: '700ms' },
        '.animation-delay-1000': { animationDelay: '1000ms' },
        '.animation-delay-\\[0\\.1s\\]': { 'animation-delay': '0.1s' },
        '.animation-delay-\\[0\\.4s\\]': { 'animation-delay': '0.4s' },
        '.animation-delay-\\[0\\.6s\\]': { 'animation-delay': '0.6s' },
        '.animation-delay-\\[0\\.8s\\]': { 'animation-delay': '0.8s' },
        '.animation-delay-\\[1\\.0s\\]': { 'animation-delay': '1.0s' },
        '.animation-delay-\\[1\\.2s\\]': { 'animation-delay': '1.2s' },
        '.animation-delay-\\[1\\.4s\\]': { 'animation-delay': '1.4s' },
        '.animation-delay-\\[1\\.6s\\]': { 'animation-delay': '1.6s' },
        '.animation-duration-\\[3s\\]': { 'animation-duration': '3s' },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
} satisfies Config;
    