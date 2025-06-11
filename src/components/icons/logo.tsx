import type { SVGProps } from 'react';

export function ForgeSimLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100" // Increased base size for potential scaling
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>ForgeSim Logo</title>
      {/* Base - Darker part of the anvil, using a very dark theme color */}
      <path d="M15 75H85V85H15V75Z" fill="hsl(var(--muted) / 0.5)" /> 
      <path d="M20 65H80V75H20V65Z" fill="hsl(var(--muted))" />

      {/* Body - Main anvil color, distinct from background */}
      <path d="M25 40H75V65H25V40Z" fill="hsl(var(--card-foreground) / 0.6)" /> {/* Slightly transparent foreground */}
      
      {/* Horn - Same as body */}
      <path d="M75 40C85 40 90 45 90 52.5C90 60 85 65 75 65V40Z" fill="hsl(var(--card-foreground) / 0.6)" />
      
      {/* Hardy Hole (square) & Pritchel Hole (round) - Using a dark color from the theme */}
      <rect x="30" y="30" width="10" height="10" fill="hsl(var(--background))" />
      <circle cx="65" cy="35" r="5" fill="hsl(var(--background))" />
      
      {/* Top Surface - The striking surface, using vibrant accent (gold) */}
      <path d="M20 25H80V40H20V25Z" fill="hsl(var(--accent))" /> {/* Gold Top */}
      
      {/* Highlight - a brighter shade of accent or a complementary color */}
      <path d="M22 27H78V30H22V27Z" fill="hsl(var(--accent) / 0.7)" /> {/* Brighter Gold Highlight */}

      {/* Optional: Adding a subtle outline or shadow for definition */}
      {/* Outline with primary color for a subtle glow effect */}
      <path 
        d="M14.5 74.5V85.5H85.5V74.5H80.5V64.5H20.5V74.5H14.5ZM24.5 39.5V64.5H75.5V39.5H90.5C90.5 44.5 85.5 65.5 75.5 65.5V39.5H24.5ZM19.5 24.5V40.5H80.5V24.5H19.5Z" 
        stroke="hsl(var(--primary) / 0.5)" 
        strokeWidth="1.5"
      />
    </svg>
  );
}
