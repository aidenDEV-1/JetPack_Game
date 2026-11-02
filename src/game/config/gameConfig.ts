export const PLAYER_HEIGHT = 96;

export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  playerX: 220,
  floorY: 625,
  ceilingY: 90,
  gravity: 1100,
  liftAcceleration: -1800,
  maxUpwardVelocity: -650,
  ceilingBounceVelocity: 120,
  baseSpeed: 300,
  pixelsPerMeter: 10,
  playerHeight: PLAYER_HEIGHT,
  playerLeanDegrees: -12,
  obstacleScale: {
    laserNodeDiameter: Math.round(PLAYER_HEIGHT * 0.8),
    laserBeamWidth: Math.round(PLAYER_HEIGHT * 0.2),
    laserGlowWidth: Math.round(PLAYER_HEIGHT * 0.42),
    laserMinLength: Math.round(PLAYER_HEIGHT * 2.25),
    laserMaxLength: Math.round(PLAYER_HEIGHT * 4),
    minPlayableGap: Math.round(PLAYER_HEIGHT * 1.6),
  },
} as const;
