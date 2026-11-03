import { getLeaderboard, saveGameRun } from '../../services/api/gameRecordsApi';
import type { GameRunResult, SaveRunResponse, SaveState } from './recordTypes';

export class RecordCoordinator {
  private state: SaveState = { status: 'idle' };
  private inFlight: Promise<SaveState> | null = null;
  private lastResult: GameRunResult | null = null;
  private persistedResult: GameRunResult | null = null;
  private persistedResponse: SaveRunResponse | null = null;

  public getState(): SaveState { return this.state; }

  public save(result: GameRunResult): Promise<SaveState> {
    if (this.inFlight) return this.inFlight;
    if (this.lastResult && sameResult(this.lastResult, result) && this.state.status !== 'idle') return Promise.resolve(this.state);
    this.lastResult = result;
    return this.startPersist(result);
  }

  public retry(): Promise<SaveState> {
    if (!this.lastResult) return Promise.resolve(this.state);
    return this.startPersist(this.lastResult);
  }

  private startPersist(result: GameRunResult): Promise<SaveState> {
    this.state = { status: 'saving', result };
    this.inFlight = this.persist(result);
    return this.inFlight.finally(() => { this.inFlight = null; });
  }

  private async persist(result: GameRunResult): Promise<SaveState> {
    try {
      let response = sameResult(this.persistedResult, result) ? this.persistedResponse : null;
      if (!response) {
        response = await saveGameRun(result);
        this.persistedResult = result;
        this.persistedResponse = response;
      }
      const leaderboard = await getLeaderboard();
      this.state = { status: 'saved', result, response, leaderboard };
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록 저장에 실패했습니다.';
      this.state = {
        status: 'pending',
        result,
        message,
        ...(sameResult(this.persistedResult, result) && this.persistedResponse ? { response: this.persistedResponse } : {}),
      };
    }
    return this.state;
  }
}

function sameResult(left: GameRunResult | null, right: GameRunResult): boolean {
  return Boolean(left && left.distanceMeters === right.distanceMeters && left.totalRunCoins === right.totalRunCoins && left.missionBonusCoins === right.missionBonusCoins && left.score === right.score);
}
