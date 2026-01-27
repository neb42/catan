export type TerrainType = 'forest' | 'hills' | 'fields' | 'pasture' | 'mountains' | 'desert';
export type PortType = 'generic' | 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';

export interface Hex {
  q: number;
  r: number;
  terrain: TerrainType;
  number: number | null;
}

export interface Port {
  type: PortType;
  hexQ: number;
  hexR: number;
  edge: number; // 0-5, direction facing outward
}

export interface BoardState {
  hexes: Hex[];
  ports: Port[];
}
