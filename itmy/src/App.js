import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import Win from './components/Win';
import Lose from './components/Lose';
import PauseMenu from './components/PauseMenu';

const CANVAS_WIDTH = 980;
const CANVAS_HEIGHT = 620;
const TOTAL_BOXES = 20;
const GAME_SECONDS = 30;
const GONE_STAGE = 3;
const LATE_GAME_SECONDS = 10;
const LATE_GAME_MAX_MULTIPLIER = 1.3;

const STAGE_STYLES = [
  { fill: '#d7d7d7', border: '#f0f0f0' },
  { fill: '#a0a0a0', border: '#c9c9c9' },
  { fill: '#6a6a6a', border: '#9c9c9c' },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function overlapsAny(candidate, placed) {
  return placed.some((box) => {
    const separation = 12;
    return !(
      candidate.x + candidate.width + separation < box.x ||
      candidate.x > box.x + box.width + separation ||
      candidate.y + candidate.height + separation < box.y ||
      candidate.y > box.y + box.height + separation
    );
  });
}

function createBoxes(width, height, count) {
  const boxes = [];
  const maxAttempts = 600;
  const innerPadding = 24;

  for (let id = 0; id < count; id += 1) {
    let attempts = 0;
    let created = false;

    while (attempts < maxAttempts && !created) {
      attempts += 1;
      const boxWidth = 34 + Math.random() * 86;
      const boxHeight = 30 + Math.random() * 88;
      const x = innerPadding + Math.random() * (width - boxWidth - innerPadding * 2);
      const y = innerPadding + Math.random() * (height - boxHeight - innerPadding * 2);
      const candidate = {
        id,
        x,
        y,
        width: boxWidth,
        height: boxHeight,
        melt: Math.random() * 0.45,
        meltRate: clamp(0.14 + Math.random() * 0.08 - boxWidth / 2400, 0.1, 0.22),
      };

      if (!overlapsAny(candidate, boxes)) {
        boxes.push(candidate);
        created = true;
      }
    }

    if (!created) {
      const fallbackWidth = 50 + Math.random() * 45;
      const fallbackHeight = 50 + Math.random() * 45;
      boxes.push({
        id,
        x: innerPadding + Math.random() * (width - fallbackWidth - innerPadding * 2),
        y: innerPadding + Math.random() * (height - fallbackHeight - innerPadding * 2),
        width: fallbackWidth,
        height: fallbackHeight,
        melt: Math.random() * 0.45,
        meltRate: 0.13 + Math.random() * 0.07,
      });
    }
  }

  return boxes;
}

function countFullBoxes(boxes) {
  return boxes.reduce((total, box) => total + (Math.floor(box.melt) === 0 ? 1 : 0), 0);
}

function drawMeltedBox(ctx, box, stage) {
  const style = STAGE_STYLES[Math.min(stage, STAGE_STYLES.length - 1)];

  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.border;
  ctx.lineWidth = 2;
  ctx.fillRect(box.x, box.y, box.width, box.height);
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  if (stage > 0) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.14)';
    const overlayHeight = box.height * (0.2 + stage * 0.2);
    ctx.fillRect(box.x, box.y + box.height - overlayHeight, box.width, overlayHeight);
  }
}

function drawScene(ctx, boxes, status) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  boxes.forEach((box) => {
    const stage = Math.floor(box.melt);
    if (stage >= GONE_STAGE) {
      return;
    }

    drawMeltedBox(ctx, box, stage);
  });

  if (status !== 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function App() {
  const canvasRef = useRef(null);
  const boxesRef = useRef([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const pausedTimeRef = useRef(0);

  const [status, setStatus] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [fullBoxes, setFullBoxes] = useState(TOTAL_BOXES);
  const [finalScore, setFinalScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const startGame = useCallback(() => {
    boxesRef.current = createBoxes(CANVAS_WIDTH, CANVAS_HEIGHT, TOTAL_BOXES);
    setStatus('playing');
    setTimeLeft(GAME_SECONDS);
    setFullBoxes(countFullBoxes(boxesRef.current));
    setFinalScore(0);
    startTimeRef.current = performance.now();
    lastFrameRef.current = performance.now();
  }, []);

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
        const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
        const remaining = clamp(GAME_SECONDS - elapsedSeconds, 0, GAME_SECONDS);
        const lateGameProgress = clamp((LATE_GAME_SECONDS - remaining) / LATE_GAME_SECONDS, 0, 1);
        const meltMultiplier = 1 + (LATE_GAME_MAX_MULTIPLIER - 1) * lateGameProgress;
        for (let i = 0; i < boxes.length; i += 1) {
          boxes[i].melt += boxes[i].meltRate * delta * meltMultiplier;
        }

        const hasGoneBox = boxes.some((box) => box.melt >= GONE_STAGE);

        setTimeLeft(remaining);
        setFullBoxes(countFullBoxes(boxes));

        if (hasGoneBox) {
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

      drawScene(ctx, boxesRef.current, status);

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
  }, [status, isPaused]);

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

    for (let i = boxes.length - 1; i >= 0; i -= 1) {
      const box = boxes[i];
      const insideX = pointerX >= box.x && pointerX <= box.x + box.width;
      const insideY = pointerY >= box.y && pointerY <= box.y + box.height;
      if (insideX && insideY && box.melt < GONE_STAGE) {
        box.melt = 0;
        setFullBoxes(countFullBoxes(boxes));
        break;
      }
    }
  };

  const goToMainMenu = useCallback(() => {
    setStatus('ready');
  }, []);

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
    setIsPaused(false);
    startGame();
  }, [startGame]);

  const handleMenuFromPause = useCallback(() => {
    setIsPaused(false);
    setStatus('ready');
  }, []);

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
