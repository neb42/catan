import { parseVertexId, getVertexPosition } from './geometry';

export function Settlement({
  vertexId,
  color,
  isCity,
}: {
  vertexId: string;
  color: string;
  isCity: boolean;
}) {
  const parsed = parseVertexId(vertexId);
  if (!parsed) return null;

  const position = getVertexPosition(parsed.coord, parsed.vertexIndex);
  const scale = isCity ? 1.2 : 1;
  const width = 2.6 * scale;
  const height = 2.4 * scale;

  return (
    <g transform={`translate(${position.x} ${position.y})`}>
      <g transform="translate(-1.3 -2.2)">
        <rect
          x={0}
          y={1}
          width={width}
          height={height}
          rx={0.4}
          fill={color}
          stroke="#1f1f1f"
          strokeWidth={0.25}
        />
        <polygon
          points={`${width / 2},0 ${width + 0.3},1.1 -0.3,1.1`}
          fill={color}
          stroke="#1f1f1f"
          strokeWidth={0.25}
        />
        {isCity && (
          <rect
            x={0.4}
            y={1.6}
            width={width - 0.8}
            height={height - 0.6}
            rx={0.3}
            fill={color}
            stroke="#1f1f1f"
            strokeWidth={0.25}
          />
        )}
      </g>
    </g>
  );
}
