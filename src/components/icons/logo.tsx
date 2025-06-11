import type { SVGProps } from 'react';

export function ForgeSimLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>ForgeSim Logo</title>
      {/* Base - Darker part of the anvil */}
      <path d="M15 75H85V85H15V75Z" fill="hsl(var(--muted))" /> 
      <path d="M20 65H80V75H20V65Z" fill="hsl(var(--secondary))" />

      {/* Body - Main anvil color, slightly lighter than base */}
      <path d="M25 40H75V65H25V40Z" fill="hsl(var(--card-foreground) / 0.8)" />
      
      {/* Horn - Same as body */}
      <path d="M75 40C85 40 90 45 90 52.5C90 60 85 65 75 65V40Z" fill="hsl(var(--card-foreground) / 0.8)" />
      
      {/* Hardy Hole (square) & Pritchel Hole (round) - Darker, like sidebar bg */}
      <rect x="30" y="30" width="10" height="10" fill="hsl(var(--sidebar-background))" />
      <circle cx="65" cy="35" r="5" fill="hsl(var(--sidebar-background))" />
      
      {/* Top Surface - The striking surface, could be primary or accent */}
      <path d="M20 25H80V40H20V25Z" fill="hsl(var(--primary))" /> {/* Gold Top */}
      {/* Highlight - a brighter gold or contrasting detail */}
      <path d="M22 27H78V30H22V27Z" fill="hsl(var(--accent) / 0.7)" /> {/* Brighter Gold Highlight */}

      {/* Optional: Adding a subtle shadow or outline to make it pop on dark backgrounds */}
      <path d="M14 86H86V74H14V86ZM19 76H81V64H19V76ZM24 66H76V39H24V66Z M74 41C84 41 89 46 89 52.5C89 59 84 64 74 64V41Z M19 24H81V41H19V24Z" stroke="hsl(var(--background) / 0.5)" strokeWidth="1" />

    </svg>
  );
}
