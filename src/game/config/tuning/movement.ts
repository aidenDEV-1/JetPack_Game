export const MOVEMENT_TUNING = {
  gravity: 1100,
  liftAcceleration: -1800,
  maxUpwardVelocity: -650,
  floorOffset: 55,
  ceilingOffset: 55,
  ceilingBounceVelocity: 120,
  crash: {
    hitStopMs: 80,
    bounceCount: 2,
    bounceHeightPx: 72,
    bounceDurationMs: 180,
    slideDurationMs: 480,
    slideSpeedPxPerSecond: 180,
  },
} as const;
