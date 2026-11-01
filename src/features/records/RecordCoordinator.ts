import { getLeaderboard, saveGameRun } from '../../services/api/gameRecordsApi';
import type { GameRunResult, SaveState } from './recordTypes';

export class RecordCoordinator {
  private state: SaveState = { status: 'idle' };
  private inFlight: Promise<SaveState> | null = null;
  private lastResult: GameRunResult | null = null;

  public getState(): SaveState { return this.state; }

  public save(result: GameRunResult): Promise<SaveState> {
    if (this.inFlight) return this.inFlight;
    this.lastResult = result;
    this.state = { status: 'saving', result };
    this.inFlight = this.persist(result);
    return this.inFlight.finally(() => { this.inFlight = null; });
  }

  public retry(): Promise<SaveState> {
    if (!this.lastResult) return Promise.resolve(this.state);
    return this.save(this.lastResult);
  }

  private async persist(result: GameRunResult): Promise<SaveState> {
    try {
      const response = await saveGameRun(result);
      const leaderboard = await getLeaderboard();
      this.state = { status: 'saved', result, response, leaderboard };
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록 저장에 실패했습니다.';
      this.state = { status: 'pending', result, message };
    }
    return this.state;
  }
}
