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
        'ping-once': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
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
        'ping-once': 'ping-once 1.5s cubic-bezier(0, 0, 0.2, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 10s linear infinite',
      },
      boxShadow: { // Enhanced shadows for dark theme
        'accent-glow-sm': '0 0 10px 1px hsl(var(--accent) / 0.6)',
        'accent-glow-md': '0 0 20px 3px hsl(var(--accent) / 0.7)',
        'accent-glow-lg': '0 0 30px 5px hsl(var(--accent) / 0.8)',
        'primary-glow-sm': '0 0 10px 1px hsl(var(--primary) / 0.6)',
        'primary-glow-md': '0 0 20px 3px hsl(var(--primary) / 0.7)',
        'primary-glow-lg': '0 0 30px 5px hsl(var(--primary) / 0.8)',
        'card-deep': '0 10px 30px -5px hsl(var(--background) / 0.6), 0 8px 15px -8px hsl(var(--background) / 0.8)',
      },
      backgroundImage: { // For gradients
        'nexus-gradient-main': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.3) 50%, hsl(var(--background)) 100%)',
        'nexus-gradient-hero': 'radial-gradient(ellipse at bottom, hsl(var(--primary)/0.3) 0%, transparent 60%)',
        'game-card-gradient': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--accent) / 0.1) 100%)',
        'game-button-gradient': 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)',
      },
      backgroundSize: { // For background-pan animation
        '200%': '200% 200%',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;