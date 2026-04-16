import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import Win from './components/Win';
import Lose from './components/Lose';
import PauseMenu from './components/PauseMenu';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TOTAL_BOXES,
  GAME_SECONDS,
  GONE_STAGE,
  LATE_GAME_SECONDS,
  LATE_GAME_MAX_MULTIPLIER,
  STAGE_STYLES,
} from './logic/gameConfig';
import {
  createBoxes,
  countFullBoxes,
  drawScene,
  getRemainingTime,
  getLateGameMeltMultiplier,
  applyMeltProgress,
  resetBoxAtPointer,
} from './logic/gameLogic';
import { useGameAudio } from './logic/useGameAudio';

function App() {
  const canvasRef = useRef(null);
  const boxesRef = useRef([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const { playRoundMusic, playShatter, playNonVictoryEndAudio } = useGameAudio();

  const [status, setStatus] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [fullBoxes, setFullBoxes] = useState(TOTAL_BOXES);
  const [finalScore, setFinalScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const startGame = useCallback(() => {
    playRoundMusic();

    boxesRef.current = createBoxes(CANVAS_WIDTH, CANVAS_HEIGHT, TOTAL_BOXES);
    setStatus('playing');
    setTimeLeft(GAME_SECONDS);
    setFullBoxes(countFullBoxes(boxesRef.current));
    setFinalScore(0);
    startTimeRef.current = performance.now();
    lastFrameRef.current = performance.now();
  }, [playRoundMusic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    const tick = (timestamp) => {
      const boxes = boxesRef.current;
      let shouldContinue = true;

      if (status === 'playing' && !isPaused) {
        const delta = (timestamp - lastFrameRef.current) / 1000;
        lastFrameRef.current = timestamp;
        const remaining = getRemainingTime(startTimeRef.current, timestamp, GAME_SECONDS);
        const meltMultiplier = getLateGameMeltMultiplier(
          remaining,
          LATE_GAME_SECONDS,
          LATE_GAME_MAX_MULTIPLIER
        );
        applyMeltProgress(boxes, delta, meltMultiplier);

        const hasGoneBox = boxes.some((box) => box.melt >= GONE_STAGE);

        setTimeLeft(remaining);
        setFullBoxes(countFullBoxes(boxes));

        if (hasGoneBox) {
          playNonVictoryEndAudio();
          setStatus('lost');
          shouldContinue = false;
        } else if (remaining <= 0) {
          const score = countFullBoxes(boxes);
          setFinalScore(score);
          setStatus('won');
          shouldContinue = false;
        }
      } else if (status === 'playing' && isPaused) {
        lastFrameRef.current = timestamp;
      }

      drawScene({
        ctx,
        boxes: boxesRef.current,
        status,
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
        goneStage: GONE_STAGE,
        stageStyles: STAGE_STYLES,
      });

      if (shouldContinue) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status, isPaused, playNonVictoryEndAudio]);

  const handleCanvasClick = (event) => {
    if (status !== 'playing' || isPaused) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pointerX = (event.clientX - rect.left) * scaleX;
    const pointerY = (event.clientY - rect.top) * scaleY;
    const boxes = boxesRef.current;

    const { didReset, wasMelting } = resetBoxAtPointer(boxes, pointerX, pointerY, GONE_STAGE);
    if (didReset) {
      if (wasMelting) {
        playShatter();
      }
      setFullBoxes(countFullBoxes(boxes));
    }
  };

  const goToMainMenu = useCallback(() => {
    if (status === 'playing') {
      playNonVictoryEndAudio();
    }
    setStatus('ready');
  }, [playNonVictoryEndAudio, status]);

  const handleStop = useCallback(() => {
    pausedTimeRef.current = performance.now();
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    // Adjust start time to account for pause duration
    const pauseDuration = performance.now() - pausedTimeRef.current;
    startTimeRef.current += pauseDuration;
    lastFrameRef.current = performance.now();
    setIsPaused(false);
  }, []);

  const handleRestartFromPause = useCallback(() => {
    playNonVictoryEndAudio();
    setIsPaused(false);
    startGame();
  }, [playNonVictoryEndAudio, startGame]);

  const handleMenuFromPause = useCallback(() => {
    playNonVictoryEndAudio();
    setIsPaused(false);
    setStatus('ready');
  }, [playNonVictoryEndAudio]);

  if (status === 'ready') {
    return <MainMenu onStart={startGame} />;
  }

  if (status === 'won') {
    return <Win score={finalScore} onRestart={startGame} onMainMenu={goToMainMenu} />;
  }

  if (status === 'lost') {
    return <Lose onRestart={startGame} onMainMenu={goToMainMenu} />;
  }

  return (
    <>
      <GameScreen
        timeLeft={timeLeft}
        fullBoxes={fullBoxes}
        totalBoxes={TOTAL_BOXES}
        canvasRef={canvasRef}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
        onCanvasClick={handleCanvasClick}
        onStop={handleStop}
      />
      {isPaused && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestartFromPause}
          onMainMenu={handleMenuFromPause}
        />
      )}
    </>
  );
}

export default App;
