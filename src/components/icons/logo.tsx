
import type { SVGProps } from 'react';
import Image from 'next/image';

// Renamed component from ForgeSimLogo to IncepticoLogo
export function IncepticoLogo(props: SVGProps<SVGSVGElement> & { width?: number | string; height?: number | string; className?: string }) {
  // Use provided width and height, or default to a sensible size.
  const imgWidth = typeof props.width === 'number' ? props.width : (typeof props.width === 'string' ? parseInt(props.width) : 50);
  const imgHeight = typeof props.height === 'number' ? props.height : (typeof props.height === 'string' ? parseInt(props.height) : 50);

  return (
    <Image
  src="/new-assets/inceptico-logo.png"
  alt="Inceptico Logo"
  width={imgWidth + 7} // Increase width by 5px
  height={imgHeight}
  className={`${props.className} rounded-[7px]`} // Add border-radius
  priority
  data-ai-hint="company brand"
/>
  );
}
