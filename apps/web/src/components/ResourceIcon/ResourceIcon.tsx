import { ResourceType } from '@catan/shared';

const RESOURCE_SVG_MAP: Record<ResourceType, string> = {
  wood: '/assets/tiles/forest.svg',
  brick: '/assets/tiles/hills.svg',
  sheep: '/assets/tiles/pasture.svg',
  wheat: '/assets/tiles/fields.svg',
  ore: '/assets/tiles/mountains.svg',
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wood: 'Wood',
  brick: 'Brick',
  sheep: 'Sheep',
  wheat: 'Wheat',
  ore: 'Ore',
};

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
};

interface ResourceIconProps {
  type: ResourceType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function ResourceIcon({ type, size = 'md' }: ResourceIconProps) {
  const pixelSize = SIZE_MAP[size];
  const svgPath = RESOURCE_SVG_MAP[type];
  const altText = RESOURCE_LABELS[type];

  return (
    <img
      src={svgPath}
      alt={altText}
      style={{
        width: pixelSize,
        height: pixelSize,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}
