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

const ICE_CAP_SOURCES = ['/Images/iceCap1.png', '/Images/iceCap2.png', '/Images/iceCap3.png'];

const ICE_CAP_STAGE_INDICATORS = [
  { border: '#FFFFFF', accent: '#5DBFDB' },
  { border: '#FFD700', accent: '#0F4C6B' },
  { border: '#C41E3A', accent: '#FFFFFF' },
];

const ICE_CAP_IMAGES = ICE_CAP_SOURCES.map((source) => {
  const image = new Image();
  image.src = source;
  return image;
});

function drawFallbackIceCap(ctx, box, stage) {
  const stageTints = ['rgba(255, 255, 255, 0.95)', 'rgba(93, 191, 219, 0.9)', 'rgba(196, 30, 58, 0.82)'];
  ctx.fillStyle = stageTints[Math.min(stage, stageTints.length - 1)];
  ctx.strokeStyle = ICE_CAP_STAGE_INDICATORS[Math.min(stage, ICE_CAP_STAGE_INDICATORS.length - 1)].border;
  ctx.lineWidth = 3;
  ctx.fillRect(box.x, box.y, box.width, box.height);
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function drawIceCapImage(ctx, box, stage) {
  const image = ICE_CAP_IMAGES[Math.min(stage, ICE_CAP_IMAGES.length - 1)];

  if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
    drawFallbackIceCap(ctx, box, stage);
    return;
  }

  const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = box.x + (box.width - drawWidth) / 2;
  const drawY = box.y + (box.height - drawHeight) / 2;

  const indicator = ICE_CAP_STAGE_INDICATORS[Math.min(stage, ICE_CAP_STAGE_INDICATORS.length - 1)];
  const frameInset = 3;
  const frameX = drawX - frameInset;
  const frameY = drawY - frameInset;
  const frameWidth = drawWidth + frameInset * 2;
  const frameHeight = drawHeight + frameInset * 2;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = indicator.border;
  ctx.shadowColor = indicator.accent;
  ctx.shadowBlur = 0;
  ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

  ctx.lineWidth = 2;
  ctx.strokeStyle = indicator.accent;
  ctx.strokeRect(frameX + 4, frameY + 4, frameWidth - 8, frameHeight - 8);

  ctx.fillStyle = indicator.border;
  ctx.fillRect(frameX - 5, frameY - 5, 10, 10);
  ctx.restore();
}

export function drawScene({ ctx, boxes, status, canvasWidth, canvasHeight, goneStage }) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  boxes.forEach((box) => {
    const stage = Math.floor(box.melt);
    if (stage >= goneStage) {
      return;
    }

    drawIceCapImage(ctx, box, stage);
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
