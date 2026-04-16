export function clamp(value, min, max) {
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

export function createBoxes(width, height, count) {
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

export function countFullBoxes(boxes) {
  return boxes.reduce((total, box) => total + (Math.floor(box.melt) === 0 ? 1 : 0), 0);
}

function drawMeltedBox(ctx, box, stage, stageStyles) {
  const style = stageStyles[Math.min(stage, stageStyles.length - 1)];

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

export function drawScene({ ctx, boxes, status, canvasWidth, canvasHeight, goneStage, stageStyles }) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  boxes.forEach((box) => {
    const stage = Math.floor(box.melt);
    if (stage >= goneStage) {
      return;
    }

    drawMeltedBox(ctx, box, stage, stageStyles);
  });

  if (status !== 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

export function getRemainingTime(startTimestamp, nowTimestamp, gameSeconds) {
  const elapsedSeconds = (nowTimestamp - startTimestamp) / 1000;
  return clamp(gameSeconds - elapsedSeconds, 0, gameSeconds);
}

export function getLateGameMeltMultiplier(remaining, lateGameSeconds, maxMultiplier) {
  const lateGameProgress = clamp((lateGameSeconds - remaining) / lateGameSeconds, 0, 1);
  return 1 + (maxMultiplier - 1) * lateGameProgress;
}

export function applyMeltProgress(boxes, delta, meltMultiplier) {
  for (let i = 0; i < boxes.length; i += 1) {
    boxes[i].melt += boxes[i].meltRate * delta * meltMultiplier;
  }
}

export function resetBoxAtPointer(boxes, pointerX, pointerY, goneStage) {
  for (let i = boxes.length - 1; i >= 0; i -= 1) {
    const box = boxes[i];
    const insideX = pointerX >= box.x && pointerX <= box.x + box.width;
    const insideY = pointerY >= box.y && pointerY <= box.y + box.height;

    if (insideX && insideY && box.melt < goneStage) {
      const wasMelting = box.melt > 0;
      box.melt = 0;
      return { didReset: true, wasMelting };
    }
  }

  return { didReset: false, wasMelting: false };
}
