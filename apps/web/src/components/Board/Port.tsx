import { Port as PortType } from '@catan/shared';

interface PortProps {
  port: PortType;
}

export function Port({ port }: PortProps) {
  // Calculate position based on hex coordinates and edge direction
  // Position port icon between hex and ocean
  const angle = port.edge * 60; // Each edge is 60 degrees apart
  const distance = 15; // Distance from hex center
  
  const x = port.hexQ + Math.cos(angle * Math.PI / 180) * distance;
  const y = port.hexR + Math.sin(angle * Math.PI / 180) * distance;
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      <image 
        href={`/assets/ports/${port.type}.svg`}
        width="8" 
        height="8"
        x="-4"
        y="-4"
      />
    </g>
  );
}
