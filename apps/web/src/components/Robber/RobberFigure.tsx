interface RobberFigureProps {
  x: number;
  y: number;
  size?: number;
}

export function RobberFigure({ x, y, size = 30 }: RobberFigureProps) {
  // Simple robber figure - dark silhouette
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Body - dark oval */}
      <ellipse
        cx={0}
        cy={size * 0.2}
        rx={size * 0.35}
        ry={size * 0.5}
        fill="rgba(30, 30, 30, 0.85)"
        stroke="#000"
        strokeWidth={1.5}
      />
      {/* Head - dark circle */}
      <circle
        cx={0}
        cy={-size * 0.35}
        r={size * 0.25}
        fill="rgba(30, 30, 30, 0.85)"
        stroke="#000"
        strokeWidth={1.5}
      />
    </g>
  );
}
