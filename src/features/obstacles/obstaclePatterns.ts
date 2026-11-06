import type { LaserVisualSpec, ObstaclePattern, PlayableGap } from './obstacleTypes';
import { GAME_CONFIG } from '../../game/config/gameConfig';

const STRAIGHT: ObstaclePattern['motion'] = { type: 'straight', amplitudePx: 0, periodMs: 1, rotationDegPerSecond: 0 };
const SECURITY_HOVER: ObstaclePattern['motion'] = { type: 'hover', amplitudePx: 8, periodMs: 1650, rotationDegPerSecond: 0 };
const ELECTRO_SWAY: ObstaclePattern['motion'] = { type: 'sway', amplitudePx: 12, periodMs: 1200, rotationDegPerSecond: 0 };
const ROTOR_SPIN: ObstaclePattern['motion'] = { type: 'spin', amplitudePx: 5, periodMs: 1300, rotationDegPerSecond: 145 };
const OBSTACLE_SCALE = GAME_CONFIG.obstacleScale;

const RED_LASER: LaserVisualSpec = {
  beamWidth: OBSTACLE_SCALE.laserBeamWidth,
  coreWidth: 3,
  glowWidth: OBSTACLE_SCALE.laserGlowWidth,
  glowColor: 0xff8b102c,
  beamColor: 0xffef3340,
  coreColor: 0xfffff5d6,
  emitterColor: 0xffff5a5f,
  emitterFrame: 0,
  emitterWidth: OBSTACLE_SCALE.laserNodeDiameter,
  emitterHeight: OBSTACLE_SCALE.laserNodeDiameter,
  chargeDurationMs: 360,
  sparkColor: 0xffffc857,
};

const BLUE_LASER: LaserVisualSpec = {
  ...RED_LASER,
  glowColor: 0xff104f98,
  beamColor: 0xff2864ff,
  coreColor: 0xffe9fbff,
  emitterColor: 0xff48b9ff,
  sparkColor: 0xff9cecff,
};

export const obstaclePatterns: ObstaclePattern[] = [
  {
    id: 'vertical-laser',
    kind: 'vertical-laser',
    visualId: 'security-drone',
    motion: STRAIGHT,
    warningArrow: false,
    width: OBSTACLE_SCALE.laserBeamWidth,
    height: GAME_CONFIG.floorY - GAME_CONFIG.ceilingY,
    displayWidth: OBSTACLE_SCALE.laserNodeDiameter,
    displayHeight: GAME_CONFIG.floorY - GAME_CONFIG.ceilingY,
    accentColor: 0xffef3340,
    warningColor: 0xffffc857,
    laserSpan: { orientation: 'vertical', mode: 'random', minLength: OBSTACLE_SCALE.laserMinLength, maxLength: OBSTACLE_SCALE.laserMaxLength, margin: 0 },
    laserVisual: RED_LASER,
  },
  {
    id: 'horizontal-laser',
    kind: 'horizontal-laser',
    visualId: 'security-drone',
    motion: STRAIGHT,
    warningArrow: false,
    width: OBSTACLE_SCALE.laserBeamWidth,
    height: 34,
    displayWidth: GAME_CONFIG.width,
    displayHeight: OBSTACLE_SCALE.laserNodeDiameter,
    accentColor: 0xff2864ff,
    warningColor: 0xffffc857,
    laserSpan: { orientation: 'horizontal', mode: 'random', minLength: OBSTACLE_SCALE.laserMinLength, maxLength: OBSTACLE_SCALE.laserMaxLength, margin: 0 },
    laserVisual: BLUE_LASER,
  },
  {
    id: 'missile',
    kind: 'missile',
    visualId: 'missile',
    motion: STRAIGHT,
    warningArrow: true,
    width: 90,
    height: 34,
    displayWidth: Math.round(GAME_CONFIG.playerHeight * 1.5),
    displayHeight: Math.round(GAME_CONFIG.playerHeight * 0.5),
    accentColor: 0xffff5a5f,
    warningColor: 0xffffc857,
  },
  {
    id: 'monster',
    kind: 'monster',
    visualId: 'security-drone',
    motion: SECURITY_HOVER,
    warningArrow: false,
    width: 72,
    height: 72,
    displayWidth: Math.round(GAME_CONFIG.playerHeight * 0.9),
    displayHeight: Math.round(GAME_CONFIG.playerHeight * 0.9),
    accentColor: 0xff3bcef5,
    warningColor: 0xffffc857,
  },
  {
    id: 'electro-drone',
    kind: 'monster',
    visualId: 'electro-drone',
    motion: ELECTRO_SWAY,
    warningArrow: true,
    width: 82,
    height: 82,
    displayWidth: Math.round(GAME_CONFIG.playerHeight * 0.95),
    displayHeight: Math.round(GAME_CONFIG.playerHeight * 0.95),
    accentColor: 0xff26d9f5,
    warningColor: 0xffffc857,
  },
  {
    id: 'rotor',
    kind: 'monster',
    visualId: 'rotor',
    motion: ROTOR_SPIN,
    warningArrow: true,
    width: 78,
    height: 78,
    displayWidth: Math.round(GAME_CONFIG.playerHeight),
    displayHeight: Math.round(GAME_CONFIG.playerHeight),
    accentColor: 0xff38e8ff,
    warningColor: 0xffffc857,
  },
];

export function isReachablePattern(gaps: PlayableGap[], minimumGap = OBSTACLE_SCALE.minPlayableGap): boolean {
  return gaps.some((gap) => gap.endY - gap.startY >= minimumGap);
}
