import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import type { GameBridge } from '../game/PhaserGame';
import type { RunScene } from '../game/scenes/RunScene';
import { azureStaticWebAppsAuth } from '../services/auth/azureStaticWebAppsAuth';
import { GameHud } from '../features/hud/GameHud';
import { initialHud } from '../features/hud/hudTypes';
import { SettingsMenu } from '../features/settings/SettingsMenu';
import { audioController } from '../services/audio/AudioController';
import { ClockOverlay, StartOverlay } from '../features/start/ClockOverlay';
import { StartSequence } from '../features/start/StartSequence';

export function GameShell() {
  const gameRootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hud] = useState(initialHud);
  const [muted, setMuted] = useState(audioController.isMuted());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [clockValue, setClockValue] = useState<'4:59:59' | '5:00:00'>('4:59:59');
  const [clockVisible, setClockVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let disposed = false;
    let destroyGame: (() => void) | undefined;

    void import('../game/PhaserGame').then(({ createPhaserGame }) => {
      if (disposed || !gameRootRef.current) return;
      const bridge: GameBridge = { onReady: () => setGameReady(true) };
      const game = createPhaserGame(gameRootRef.current, bridge);
      gameRef.current = game;
      destroyGame = () => game.destroy(true);
      void audioController.playMusic();
    });

    return () => {
      disposed = true;
      audioController.stop();
      destroyGame?.();
    };
  }, []);

  const getRunScene = (): RunScene | null => {
    const scene = gameRef.current?.scene.getScene('RunScene');
    return scene ? scene as RunScene : null;
  };

  const pause = () => { getRunScene()?.pauseFromSettings(); setPaused(true); };
  const resume = () => {
    getRunScene()?.resumeFromSettings((value) => setCountdown(value), () => { setCountdown(null); setPaused(false); });
  };
  const toggleMute = () => setMuted(audioController.toggleMute());
  const startGame = async () => {
    const sequence = new StartSequence({
      onClockChange: (value) => { setClockValue(value); setClockVisible(true); },
      onAlarm: () => undefined,
      onComplete: () => { getRunScene()?.beginRun(); setClockVisible(false); setStarted(true); },
    });
    await sequence.play();
  };

  return (
    <main className="app-shell">
      <section className="game-frame" aria-label="덱스 탈출 넘버원 5PM RUSH 게임 화면">
        <div ref={gameRootRef} className="game-root" />
        {gameReady && !started && !clockVisible ? <StartOverlay onStart={() => void startGame()} /> : null}
        <ClockOverlay visible={clockVisible} value={clockValue} />
        <GameHud {...hud} paused={paused} muted={muted} onSettings={() => setSettingsOpen(true)} />
        <SettingsMenu open={settingsOpen} paused={paused} muted={muted} countdown={countdown} onClose={() => setSettingsOpen(false)} onPause={pause} onResume={resume} onToggleMute={toggleMute} onExit={() => azureStaticWebAppsAuth.logout()} />
        {!gameReady ? <div className="loading-chip">게임 준비 중</div> : null}
      </section>
    </main>
  );
}
