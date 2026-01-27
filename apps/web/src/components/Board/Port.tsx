import { Port as PortType, getPortPosition, getEdgeAngle } from '@catan/shared';

interface PortProps {
  port: PortType;
}

export function Port({ port }: PortProps) {
  const size = { x: 10, y: 10 };
  const distance = 15;
  const spacing = 1.05;

  // Calculate pixel position using proper hex-to-pixel conversion
  // Matches Board.tsx Layout: size={x: 10, y: 10}, flat=false, spacing=1.05
  const position = getPortPosition(
    port.hexQ,
    port.hexR,
    port.edge,
    size, // Match Board Layout size
    distance, // Distance from hex center to position port outside boundary
    spacing // Match Board Layout spacing
  );

  const angle = getEdgeAngle(port.edge);
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  // Vector from Center to Port
  const portRad = toRadians(angle);
  const portOffset = {
    x: Math.cos(portRad) * distance,
    y: Math.sin(portRad) * distance,
  };

  // Vectors from Center to Corners
  // Pointy top hex corners relative to edge angle: -30 and +30 degrees
  const corner1Rad = toRadians(angle - 30);
  const corner2Rad = toRadians(angle + 30);

  const corner1Offset = {
    x: Math.cos(corner1Rad) * size.x,
    y: Math.sin(corner1Rad) * size.y,
  };

  const corner2Offset = {
    x: Math.cos(corner2Rad) * size.x,
    y: Math.sin(corner2Rad) * size.y,
  };

  // End points relative to Port (0,0)
  const end1 = {
    x: corner1Offset.x - portOffset.x,
    y: corner1Offset.y - portOffset.y,
  };

  const end2 = {
    x: corner2Offset.x - portOffset.x,
    y: corner2Offset.y - portOffset.y,
  };

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <line
        x1="0"
        y1="0"
        x2={end1.x}
        y2={end1.y}
        stroke="#8B4513"
        strokeWidth="2"
      />
      <line
        x1="0"
        y1="0"
        x2={end2.x}
        y2={end2.y}
        stroke="#8B4513"
        strokeWidth="2"
      />
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
