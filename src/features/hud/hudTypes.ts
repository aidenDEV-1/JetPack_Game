export interface HudViewModel {
  distanceMeters: number;
  runCoins: number;
  tokenCount: number;
  hasShield: boolean;
  boosterActive: boolean;
  boosterRemainingMs: number;
  paused: boolean;
}

export const initialHud: HudViewModel = {
  distanceMeters: 0,
  runCoins: 0,
  tokenCount: 0,
  hasShield: false,
  boosterActive: false,
  boosterRemainingMs: 0,
  paused: false,
};
