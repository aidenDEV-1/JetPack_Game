import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { createPhaserGame, type GameBridge } from '../game/PhaserGame';
import { AuthGate } from '../features/auth/AuthGate';
import { azureStaticWebAppsAuth } from '../services/auth/azureStaticWebAppsAuth';
import { GameHud } from '../features/hud/GameHud';
import { initialHud } from '../features/hud/hudTypes';
import { SettingsMenu } from '../features/settings/SettingsMenu';
import { audioController } from '../services/audio/AudioController';
import type { RunScene } from '../game/scenes/RunScene';
import { ClockOverlay, StartOverlay } from '../features/start/ClockOverlay';
import { StartSequence } from '../features/start/StartSequence';

export function App() {
  return <AuthGate authService={azureStaticWebAppsAuth}><GameShell /></AuthGate>;
}

function GameShell() {
  const gameRootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hud] = useState(initialHud);
  const [muted, setMuted] = useState(audioController.isMuted());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [clockValue, setClockValue] = useState<'4:59:59' | '5:00:00'>('4:59:59');
  const [clockVisible, setClockVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!gameRootRef.current) return;

    const bridge: GameBridge = {
      onReady: () => undefined,
    };
    const game = createPhaserGame(gameRootRef.current, bridge);
    gameRef.current = game;
    void audioController.playMusic();

    return () => { audioController.stop(); game.destroy(true); };
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
        {!started && !clockVisible ? <StartOverlay onStart={() => void startGame()} /> : null}
        <ClockOverlay visible={clockVisible} value={clockValue} />
        <GameHud {...hud} paused={paused} muted={muted} onSettings={() => setSettingsOpen(true)} />
        <SettingsMenu open={settingsOpen} paused={paused} muted={muted} countdown={countdown} onClose={() => setSettingsOpen(false)} onPause={pause} onResume={resume} onToggleMute={toggleMute} onExit={() => azureStaticWebAppsAuth.logout()} />
        <div className="loading-chip">게임 준비 중</div>
      </section>
    </main>
  );
}
