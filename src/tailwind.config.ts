
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
        headline: ['Inter', 'sans-serif'], 
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
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'subtle-pulse': { 
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.05)' },
        },
        'glow': { 
          '0%, 100%': { filter: 'brightness(1)', opacity: '0.8' },
          '50%': { filter: 'brightness(1.5)', opacity: '1' },
        },
        'orbit': { 
          'from': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          'to': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'fadeIn': { 
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fadeInUp': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
         'background-pan': { 
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'float-rotate-3d': {
          '0%': { transform: 'translateZ(var(--start-z, 0px)) rotateX(var(--start-rotateX, 0deg)) rotateY(var(--start-rotateY, 0deg)) translateY(0px) scale(1)', opacity: 'var(--start-opacity, 0.3)' },
          '50%': { transform: 'translateZ(calc(var(--start-z, 0px) + 20px)) rotateX(calc(var(--start-rotateX, 0deg) + 20deg)) rotateY(calc(var(--start-rotateY, 0deg) + 30deg)) translateY(-20px) scale(1.05)', opacity: 'calc(var(--start-opacity, 0.3) + 0.2)' },
          '100%': { transform: 'translateZ(var(--start-z, 0px)) rotateX(var(--start-rotateX, 0deg)) rotateY(var(--start-rotateY, 0deg)) translateY(0px) scale(1)', opacity: 'var(--start-opacity, 0.3)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: 'var(--start-opacity, 0.3)', transform: 'scale(0.8)' },
          '50%': { opacity: 'calc(var(--start-opacity, 0.3) + 0.5)', transform: 'scale(1.2)', boxShadow: '0 0 10px 2px hsl(var(--accent)/0.8)' },
        },
         'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'spin-slowest': {
          to: { transform: 'rotate(360deg)' },
        },
         'honeycomb-ripple-scale-fade': {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(16)', opacity: '0' },
        },
        'particle-burst-rise-fade': {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0.9' },
          '100%': { transform: 'translateY(-250px) scale(0.3)', opacity: '0' },
        },
        'avatar-glide-in': {
          '0%': { opacity: '0', transform: 'translateY(50px) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'text-fade-in-scale-up': {
           '0%': { opacity: '0', transform: 'scale(0.9)' },
           '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'orb-pulse': { 
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 15px hsl(var(--accent)/0.6))' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 25px hsl(var(--accent)/0.8))' },
        },
        'ring-rotate-scale': { 
          '0%': { transform: 'rotate(0deg) scale(0.8)', opacity: '0.7' },
          '50%': { transform: 'rotate(180deg) scale(1)', opacity: '0.3' },
          '100%': { transform: 'rotate(360deg) scale(0.8)', opacity: '0.7' },
        },
        'data-stream': { 
            '0%': { transform: 'translateY(-100%)', opacity: '0' },
            '20%, 80%': { opacity: '0.3' },
            '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'subtle-pulse-orb': { 
          '0%, 100%': { filter: 'drop-shadow(0 0 10px hsl(var(--accent)/0.5)) brightness(1)', transform: 'scale(1)' },
          '50%': { filter: 'drop-shadow(0 0 18px hsl(var(--accent)/0.7)) brightness(1.1)', transform: 'scale(1.03)' },
        },
        'pulse-glow-border': { 
          '0%, 100%': { 
            'box-shadow': '0 0 0px 0px var(--glow-color, hsl(var(--accent)/0.4)), inset 0 0 0px 0px var(--glow-color, hsl(var(--accent)/0.2))',
            'border-color': 'var(--border-color, hsl(var(--accent)/0.7))',
          },
          '50%': { 
            'box-shadow': '0 0 15px 3px var(--glow-color, hsl(var(--accent)/0.4)), inset 0 0 5px 1px var(--glow-color, hsl(var(--accent)/0.2))',
            'border-color': 'var(--border-color-active, hsl(var(--accent)))',
          },
        },
        'float-pulse': { 
          '0%, 100%': { transform: 'translateY(0px) scale(1)', filter: 'drop-shadow(0 0 12px hsl(var(--accent)/0.5))'},
          '50%': { transform: 'translateY(-5px) scale(1.02)', filter: 'drop-shadow(0 0 18px hsl(var(--accent)/0.65))'},
        },
        'subtle-grid-pan': { 
          '0%': { 'background-position': '0 0' },
          '100%': { 'background-position': '80px 80px' }, 
        },
         'subtle-grid-pan-faster': { /* For enhanced hive grid */
          '0%': { 'background-position': '0 0' },
          '100%': { 'background-position': '60px 60px' },
        },
         'shimmer': { 
          '0%': { transform: 'translateX(-100%) skewX(-20deg)' },
          '100%': { transform: 'translateX(200%) skewX(-20deg)' },
        },
        'title-underline-glow': { 
          '0%, 100%': { width: '40%', filter: 'blur(0.5px) brightness(0.9)', opacity: '0.8', backgroundColor: 'hsl(var(--accent) / 0.7)' },
          '50%': { width: '66.66%', filter: 'blur(1px) brightness(1.2)', opacity: '1', backgroundColor: 'hsl(var(--accent))' },
        },
        'subtle-button-pulse': { 
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 5px hsl(var(--accent)/0.3)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 0 10px hsl(var(--accent)/0.45)' },
        },
         'drift': { /* For particle field */
          '0%': { transform: 'translate(var(--x-start), var(--y-start))', opacity: '0' },
          '25%': { opacity: '0.7' },
          '75%': { opacity: '0.7' },
          '100%': { transform: 'translate(var(--x-end), var(--y-end))', opacity: '0'},
        },
        'digital-nectar-sweep': { /* For completed hex modules */
          '0%': { opacity: '0', transform: 'scaleY(0)', 'transform-origin': 'bottom' },
          '50%': { opacity: '0.7', transform: 'scaleY(1)', 'transform-origin': 'bottom' },
          '100%': { opacity: '0.5', transform: 'scaleY(1)', 'transform-origin': 'bottom' },
        }
      },
      boxShadow: { 
        'accent-glow-sm': '0 0 10px 1px hsl(var(--accent) / 0.6)',
        'accent-glow-md': '0 0 20px 3px hsl(var(--accent) / 0.7)',
        'primary-glow-sm': '0 0 10px 1px hsl(var(--primary) / 0.6)',
        'primary-glow-md': '0 0 20px 3px hsl(var(--primary) / 0.7)',
        'card-deep': '0 10px 30px -5px hsl(var(--background) / 0.6), 0 8px 15px -8px hsl(var(--background) / 0.8)',
        'epic-depth': '0 15px 35px -10px hsl(var(--background) / 0.7), 0 10px 20px -12px hsl(var(--background) / 0.9)', 
        'inner-soft-gold': 'inset 0 2px 4px 0 hsl(var(--accent) / 0.1), inset 0 -1px 2px 0 hsl(var(--background) / 0.3)',
        'inner-soft-dim': 'inset 0 1px 3px 0 hsl(var(--background) / 0.5), inset 0 -1px 2px 0 hsl(var(--foreground) / 0.05)',
      },
      backgroundImage: { 
        'nexus-gradient-main': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.3) 50%, hsl(var(--background)) 100%)',
        'nexus-gradient-hero': 'radial-gradient(ellipse at bottom, hsl(var(--primary)/0.3) 0%, transparent 60%)',
      },
       backgroundSize: { 
        '200%': '200% 200%',
      },
      animationDelay: { 
        '0s': '0s', '0.1s': '0.1s', '0.2s': '0.2s', '0.3s': '0.3s', '0.4s': '0.4s', '0.5s': '0.5s',
        '0.6s': '0.6s', '0.7s': '0.7s', '0.8s': '0.8s', '0.9s': '0.9s',
        '1s': '1s', '1.1s': '1.1s', '1.2s': '1.2s', '1.3s': '1.3s', '1.4s': '1.4s',
        '1.5s': '1.5s', '1.6s': '1.6s', '1.8s': '1.8s', '2s':'2s', '2.3s': '2.3s'
      },
      rotate: { 
        'y-2': 'rotateY(2deg)', 'y-5': 'rotateY(5deg)', 'y-10': 'rotateY(10deg)', 'y-15': 'rotateY(15deg)',
        'x-1': 'rotateX(1deg)', 'x-2': 'rotateX(2deg)', 'x-3': 'rotateX(3deg)', 'x-5': 'rotateX(5deg)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities, theme }: { addUtilities: any, theme: any }) {
      const newUtilities: {[key: string]: any} = {
        '.perspective-1000': { perspective: '1000px' },
        '.transform-style-preserve-3d': { 'transform-style': 'preserve-3d' },
        '.rotate-y-2': { transform: 'rotateY(2deg)' },
        '.rotate-x-1': { transform: 'rotateX(1deg)' },
        '.backdrop-blur-xs': { 'backdrop-filter': 'blur(2px)'},
      };
      const animationDelays = theme('animationDelay');
      if (animationDelays) {
        Object.entries(animationDelays).forEach(([key, value]) => {
          const sanitizedKey = key.replace(/\./g, '\\.'); 
          newUtilities[`.animation-delay-\\[${sanitizedKey}\\]`] = { 'animation-delay': value as string };
        });
      }
      const animationDurations = theme('animationDuration'); 
      if (animationDurations) {
        Object.entries(animationDurations).forEach(([key, value]) => {
          newUtilities[`.animation-duration-\\[${key}\\]`] = { 'animation-duration': value as string };
        });
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'group-hover']);
    }
  ],
} satisfies Config;
