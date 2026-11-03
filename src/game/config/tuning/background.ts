export const BACKGROUND_TUNING = {
  transitionDurationMs: 220,
  layers: {
    l0: { depth: -13, repeatWidth: 1280, scrollFactor: 0.12, height: 720, y: 360, alpha: 0.92, floorTopY: null },
    l1: { depth: -12, repeatWidth: 1280, scrollFactor: 0.28, height: 720, y: 360, alpha: 0.78, floorTopY: null },
    l2: { depth: -11, repeatWidth: 1280, scrollFactor: 0.52, height: 720, y: 360, alpha: 0.72, floorTopY: null },
    l3: { depth: -10, repeatWidth: 1280, scrollFactor: 0.95, height: 720, y: 475, alpha: 1, floorTopY: 625 },
  },
} as const;
