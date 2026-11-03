export type BoosterFlightPhase = 'idle' | 'travelling-out' | 'holding' | 'travelling-back';
export type BoosterPhase = 'idle' | 'intro' | 'boosting' | 'grace' | 'complete';

export interface BoosterState {
  active: boolean;
  phase: BoosterPhase;
  remainingMs: number;
  graceRemainingMs: number;
  tokenCount: number;
  hasShield: boolean;
}
