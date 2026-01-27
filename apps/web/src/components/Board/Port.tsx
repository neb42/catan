import { Port as PortType, getPortPosition } from '@catan/shared';

interface PortProps {
  port: PortType;
}

export function Port({ port }: PortProps) {
  // Calculate pixel position using proper hex-to-pixel conversion
  // Matches Board.tsx Layout: size={x: 10, y: 10}, flat=false
  const position = getPortPosition(
    port.hexQ,
    port.hexR,
    port.edge,
    { x: 10, y: 10 }, // Match Board Layout size
    15 // Distance from hex center to position port outside boundary
  );
  
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
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
