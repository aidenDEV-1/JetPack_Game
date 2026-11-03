import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import type { GameBridge } from '../game/PhaserGame';
import type { RunState } from '../game/state/GameState';
import type { RunScene } from '../game/scenes/RunScene';
import type { GameRunResult, SaveState } from '../features/records/recordTypes';
import { azureStaticWebAppsAuth } from '../services/auth/azureStaticWebAppsAuth';
import { GameHud } from '../features/hud/GameHud';
import { initialHud } from '../features/hud/hudTypes';
import { SettingsMenu } from '../features/settings/SettingsMenu';
import { audioController } from '../services/audio/AudioController';
import { ClockOverlay, StartOverlay } from '../features/start/ClockOverlay';
import { StartSequence } from '../features/start/StartSequence';
import { RecordCoordinator } from '../features/records/RecordCoordinator';
import { ResultsPanel } from '../features/results/ResultsPanel';
import { LeaderboardPanel } from '../features/leaderboard/LeaderboardPanel';
import { clearGameTestApi } from '../game/test/GameTestApi';

interface RunResultState {
  result: GameRunResult;
  saveState: SaveState;
}

export function GameShell() {
  const gameRootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hud, setHud] = useState(initialHud);
  const [muted, setMuted] = useState(audioController.isMuted());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [clockValue, setClockValue] = useState<'4:59:59' | '5:00:00'>('4:59:59');
  const [clockVisible, setClockVisible] = useState(false);
  const [runResult, setRunResult] = useState<RunResultState | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const recordCoordinatorRef = useRef(new RecordCoordinator());
  const paused = hud.paused;

  useEffect(() => {
    let disposed = false;
    let destroyGame: (() => void) | undefined;

    void import('../game/PhaserGame').then(({ createPhaserGame }) => {
      if (disposed || !gameRootRef.current) return;
      const bridge: GameBridge = {
        onReady: () => setGameReady(true),
        onStateChange: (snapshot) => {
          if (!disposed) setHud(toHudViewModel(snapshot));
        },
        onRunEnd: (snapshot) => {
          const result = toGameRunResult(snapshot);
          setLeaderboardOpen(false);
          setRunResult({ result, saveState: { status: 'saving', result } });
          void recordCoordinatorRef.current.save(result).then((saveState) => {
            if (!disposed) setRunResult({ result, saveState });
          });
        },
      };
      const game = createPhaserGame(gameRootRef.current, bridge);
      gameRef.current = game;
      destroyGame = () => game.destroy(true);
      void audioController.playMusic();
    });

    return () => {
      disposed = true;
      audioController.stop();
      clearGameTestApi();
      destroyGame?.();
    };
  }, []);

  const getRunScene = (): RunScene | null => {
    const scene = gameRef.current?.scene.getScene('RunScene');
    return scene ? scene as RunScene : null;
  };

  const pause = () => { getRunScene()?.pauseFromSettings(); };
  const resume = () => {
    getRunScene()?.resumeFromSettings((value) => setCountdown(value), () => { setCountdown(null); });
  };
  const toggleMute = () => setMuted(audioController.toggleMute());
  const startGame = async () => {
    void audioController.resume();
    const sequence = new StartSequence({
      onClockChange: (value) => { setClockValue(value); setClockVisible(true); },
      onAlarm: () => { audioController.playSfx('alarm'); },
      onComplete: () => { getRunScene()?.beginRun(); setClockVisible(false); setStarted(true); },
    });
    void audioController.playMusic();
    await sequence.play();
  };

  const retrySave = () => {
    if (!runResult) return;
    setRunResult({ result: runResult.result, saveState: { status: 'saving', result: runResult.result } });
    void recordCoordinatorRef.current.retry().then((saveState) => setRunResult({ result: runResult.result, saveState }));
  };

  const replay = () => {
    setRunResult(null);
    setLeaderboardOpen(false);
    setStarted(false);
    setClockVisible(false);
    setCountdown(null);
    setHud(initialHud);
    getRunScene()?.restartRun();
  };

  const savedState = runResult ? getSavedState(runResult.saveState) : null;
  const savedResponse = runResult ? getSaveResponse(runResult.saveState) : undefined;
  const savePending = runResult ? runResult.saveState.status === 'saving' || runResult.saveState.status === 'pending' || runResult.saveState.status === 'error' : false;

  return (
    <main className="app-shell">
      <section className="game-frame" aria-label="덱스 탈출 넘버원 5PM RUSH 게임 화면">
        <div ref={gameRootRef} className="game-root" />
        {gameReady && !started && !clockVisible ? <StartOverlay onStart={() => void startGame()} /> : null}
        <ClockOverlay visible={clockVisible} value={clockValue} />
        <GameHud {...hud} paused={paused} muted={muted} onSettings={() => setSettingsOpen(true)} />
        <SettingsMenu open={settingsOpen} paused={paused} muted={muted} countdown={countdown} onClose={() => setSettingsOpen(false)} onPause={pause} onResume={resume} onToggleMute={toggleMute} onExit={() => azureStaticWebAppsAuth.logout()} />
        {runResult ? <div className="results-layer">
          {leaderboardOpen && savedState ? <div className="leaderboard-dialog"><LeaderboardPanel leaderboard={savedState.leaderboard} onClose={() => setLeaderboardOpen(false)} /></div> : <ResultsPanel
            distanceMeters={runResult.result.distanceMeters}
            runCoins={runResult.result.runCoins}
            totalCoins={savedResponse?.record.totalCoins ?? runResult.result.runCoins}
            bestDistanceMeters={savedResponse?.record.bestDistanceMeters ?? runResult.result.distanceMeters}
            isNewBest={savedResponse?.isNewBest ?? false}
            isRankOne={savedState?.leaderboard.currentUser?.rank === 1}
            savePending={savePending}
            leaderboardAvailable={Boolean(savedState)}
            onRetry={retrySave}
            onReplay={replay}
            onLeaderboard={() => { if (savedState) setLeaderboardOpen(true); }}
          />}
        </div> : null}
        {!gameReady ? <div className="loading-chip">게임 준비 중</div> : null}
      </section>
    </main>
  );
}

function toGameRunResult(snapshot: RunState): GameRunResult {
  const awardedCoins = snapshot.runCoins + snapshot.missions.bonusCoins;
  return {
    distanceMeters: snapshot.distanceMeters,
    runCoins: awardedCoins,
    score: Math.floor(snapshot.distanceMeters) + awardedCoins * 10,
  };
}

function getSaveResponse(saveState: SaveState): { record: { totalCoins: number; bestDistanceMeters: number }; isNewBest: boolean } | undefined {
  if (saveState.status === 'saved' || saveState.status === 'pending') return saveState.response;
  return undefined;
}

function getSavedState(saveState: SaveState): Extract<SaveState, { status: 'saved' }> | null {
  return saveState.status === 'saved' ? saveState : null;
}

function toHudViewModel(snapshot: RunState) {
  return {
    distanceMeters: snapshot.distanceMeters,
    runCoins: snapshot.runCoins,
    tokenCount: snapshot.tokenCount,
    hasShield: snapshot.hasShield,
    boosterActive: snapshot.boosterActive,
    boosterRemainingMs: snapshot.boosterRemainingMs,
    boosterPhase: snapshot.boosterPhase,
    boosterGraceRemainingMs: snapshot.boosterGraceRemainingMs,
    paused: snapshot.phase === 'paused',
  };
}
