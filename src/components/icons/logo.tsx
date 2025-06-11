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
      {/* Base */}
      <path d="M15 75H85V85H15V75Z" fill="hsl(var(--muted-foreground))" /> {/* Anvil Base Bottom */}
      <path d="M20 65H80V75H20V65Z" fill="hsl(var(--muted))" /> {/* Anvil Base Top */}
      
      {/* Body */}
      <path d="M25 40H75V65H25V40Z" fill="hsl(var(--sidebar-foreground))" /> {/* Anvil Main Body */}
      
      {/* Horn */}
      <path d="M75 40C85 40 90 45 90 52.5C90 60 85 65 75 65V40Z" fill="hsl(var(--sidebar-foreground))" />
      
      {/* Hardy Hole (square) & Pritchel Hole (round) - simplified */}
      <rect x="30" y="30" width="10" height="10" fill="hsl(var(--sidebar-background))" />
      <circle cx="65" cy="35" r="5" fill="hsl(var(--sidebar-background))" />
      
      {/* Top Surface with highlight */}
      <path d="M20 25H80V40H20V25Z" fill="hsl(var(--primary))" /> {/* Anvil Top Surface */}
      <path d="M22 27H78V30H22V27Z" fill="hsl(var(--accent))" /> {/* Gold Highlight */}
    </svg>
  );
}
