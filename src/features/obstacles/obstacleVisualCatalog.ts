import type { ObstacleVisualId } from './obstacleTypes';

export interface ObstacleVisualDefinition {
  frame: number;
  coreColor: number;
  outlineColor: number;
}

export const obstacleVisualCatalog: Record<ObstacleVisualId, ObstacleVisualDefinition> = {
  'security-drone': { frame: 0, coreColor: 0xff4de6ff, outlineColor: 0xffb9f7ff },
  'electro-drone': { frame: 1, coreColor: 0xff37dfff, outlineColor: 0xffd5fbff },
  missile: { frame: 2, coreColor: 0xffff5a5f, outlineColor: 0xffffd2a8 },
  rotor: { frame: 3, coreColor: 0xff42eaff, outlineColor: 0xffb8faff },
};
