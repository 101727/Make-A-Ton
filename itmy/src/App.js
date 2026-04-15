import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

const CANVAS_WIDTH = 980;
const CANVAS_HEIGHT = 620;
const TOTAL_BOXES = 20;
const GAME_SECONDS = 60;
const GONE_STAGE = 3;

const STAGE_STYLES = [
  { fill: '#d5d5d5', border: '#f5f5f5' },
  { fill: '#9f9f9f', border: '#c8c8c8' },
  { fill: '#646464', border: '#9f9f9f' },
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
        // Larger boxes melt slightly slower so gameplay pressure feels even.
        meltRate: clamp(0.14 + Math.random() * 0.08 - boxWidth / 2200, 0.09, 0.2),
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
        meltRate: 0.12 + Math.random() * 0.05,
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
  const meltRatio = clamp((box.melt % 1) + stage * 0.14, 0, 0.95);
  const topDrop = box.height * 0.42 * meltRatio;
  const sideInset = box.width * 0.16 * meltRatio;

  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(box.x + sideInset, box.y + topDrop);
  ctx.lineTo(box.x + box.width - sideInset, box.y + topDrop * 0.9);
  ctx.lineTo(box.x + box.width - sideInset * 0.4, box.y + box.height);
  ctx.lineTo(box.x + sideInset * 0.5, box.y + box.height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (stage >= 1) {
    ctx.fillStyle = 'rgba(18, 18, 18, 0.24)';
    const dripCount = stage + 1;
    for (let i = 0; i < dripCount; i += 1) {
      const dripX = box.x + (box.width / (dripCount + 1)) * (i + 1);
      const dripHeight = box.height * (0.06 + Math.random() * 0.12);
      const dripWidth = 3 + Math.random() * 4;
      ctx.fillRect(dripX, box.y + box.height - 1, dripWidth, dripHeight);
    }
  }
}

function drawScene(ctx, boxes, status) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#252525');
  gradient.addColorStop(1, '#111111');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, CANVAS_HEIGHT * 0.72, CANVAS_WIDTH, CANVAS_HEIGHT * 0.28);

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

  const [status, setStatus] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [fullBoxes, setFullBoxes] = useState(TOTAL_BOXES);
  const [finalScore, setFinalScore] = useState(0);

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
    startGame();
  }, [startGame]);

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

      if (status === 'playing') {
        const delta = (timestamp - lastFrameRef.current) / 1000;
        lastFrameRef.current = timestamp;

        for (let i = 0; i < boxes.length; i += 1) {
          boxes[i].melt += boxes[i].meltRate * delta;
        }

        const hasGoneBox = boxes.some((box) => box.melt >= GONE_STAGE);
        const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
        const remaining = clamp(GAME_SECONDS - elapsedSeconds, 0, GAME_SECONDS);

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
  }, [status]);

  const handleCanvasClick = (event) => {
    if (status !== 'playing') {
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

  const title =
    status === 'lost'
      ? 'You lost. A box fully melted.'
      : status === 'won'
      ? 'You survived all 60 seconds.'
      : 'Keep every box from reaching the gone stage.';

  const subtitle =
    status === 'won'
      ? `Final score: ${finalScore} full boxes`
      : 'Click boxes to reset them to full form.';

  return (
    <div className="app-shell">
      <div className="hud">
        <h1>Melt Guard</h1>
        <p>{title}</p>
        <p>{subtitle}</p>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Time Left</span>
            <strong>{timeLeft.toFixed(1)}s</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Full Boxes</span>
            <strong>
              {fullBoxes}/{TOTAL_BOXES}
            </strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">State</span>
            <strong>{status.toUpperCase()}</strong>
          </div>
        </div>
        <button type="button" onClick={startGame}>
          Restart
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
      />
    </div>
  );
}

export default App;
