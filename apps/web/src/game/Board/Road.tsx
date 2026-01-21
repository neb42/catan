import { getEdgeVertexPositions } from './geometry';

export function Road({ edgeId, color }: { edgeId: string; color: string }) {
  const positions = getEdgeVertexPositions(edgeId);
  if (!positions) return null;

  const [a, b] = positions;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  const length = Math.hypot(b.x - a.x, b.y - a.y) * 0.6;

  return (
    <g transform={`translate(${midX} ${midY}) rotate(${angle})`}>
      <rect
        x={-length / 2}
        y={-0.35}
        width={length}
        height={0.7}
        rx={0.2}
        fill={color}
        stroke="#1f1f1f"
        strokeWidth={0.2}
      />
    </g>
  );
}
