export const BACKGROUND_TUNING = {
  transitionDurationMs: 220,
  layers: {
    far: { depth: -12, repeatWidth: 1280, scrollFactor: 0.18, height: 720, y: 360, alpha: 0.72 },
    mid: { depth: -11, repeatWidth: 1280, scrollFactor: 0.42, height: 720, y: 360, alpha: 0.36 },
    near: { depth: -10, repeatWidth: 1280, scrollFactor: 0.75, height: 720, y: 360, alpha: 0.22 },
  },
} as const;
