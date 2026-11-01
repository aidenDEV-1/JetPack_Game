export type ResultPhase = 'playing' | 'crash-animation' | 'results';

export class ResultsController {
  private phase: ResultPhase = 'playing';

  public beginCrash(): void { if (this.phase === 'playing') this.phase = 'crash-animation'; }
  public finishCrash(): void { if (this.phase === 'crash-animation') this.phase = 'results'; }
  public getPhase(): ResultPhase { return this.phase; }
}
