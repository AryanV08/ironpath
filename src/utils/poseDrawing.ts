import type { Keypoint } from '@tensorflow-models/pose-detection';

const LINE_COLOR = '#cc0000';
const DOT_FILL = '#ffffff';
const DOT_STROKE = '#111111';

/** COCO / MoveNet 17 keypoint order */
export const COCO_KEYPOINTS = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
] as const;

const FACE_NAMES = new Set(['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear']);
const BODY_MIN_SCORE = 0.15;
const FACE_MIN_SCORE = 0.08;

const BODY_CONNECTIONS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

const FACE_CONNECTIONS: [string, string][] = [
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  ['left_ear', 'left_shoulder'],
  ['right_ear', 'right_shoulder'],
];

export interface DrawPoint {
  x: number;
  y: number;
  name: string;
  estimated?: boolean;
}

function minScoreFor(name: string): number {
  return FACE_NAMES.has(name) ? FACE_MIN_SCORE : BODY_MIN_SCORE;
}

/** Normalize keypoints: ensure names via COCO index fallback */
export function normalizeKeypoints(keypoints: Keypoint[]): Keypoint[] {
  return keypoints.map((kp, index) => ({
    ...kp,
    name: kp.name ?? COCO_KEYPOINTS[index] ?? `kp_${index}`,
  }));
}

function getDrawPoint(keypoints: Keypoint[], name: string): DrawPoint | null {
  const kp = keypoints.find((k) => k.name === name);
  if (!kp) return null;
  const score = kp.score ?? 1;
  if (score < minScoreFor(name)) return null;
  return { x: kp.x, y: kp.y, name };
}

/** Estimate missing face landmarks from detected nose / ears / shoulders */
function enrichFacePoints(keypoints: Keypoint[]): DrawPoint[] {
  const map = new Map<string, DrawPoint>();

  for (const name of COCO_KEYPOINTS) {
    const pt = getDrawPoint(keypoints, name);
    if (pt) map.set(name, pt);
  }

  const nose = map.get('nose');
  const lEar = map.get('left_ear');
  const rEar = map.get('right_ear');
  const lShoulder = map.get('left_shoulder');
  const rShoulder = map.get('right_shoulder');

  if (nose && !map.has('left_eye')) {
    const ref = lEar ?? lShoulder;
    if (ref) {
      map.set('left_eye', {
        x: nose.x + (ref.x - nose.x) * 0.35,
        y: nose.y + (ref.y - nose.y) * 0.15 - 8,
        name: 'left_eye',
        estimated: true,
      });
    }
  }

  if (nose && !map.has('right_eye')) {
    const ref = rEar ?? rShoulder;
    if (ref) {
      map.set('right_eye', {
        x: nose.x + (ref.x - nose.x) * 0.35,
        y: nose.y + (ref.y - nose.y) * 0.15 - 8,
        name: 'right_eye',
        estimated: true,
      });
    }
  }

  if (nose && lShoulder && rShoulder && !map.has('left_ear')) {
    map.set('left_ear', {
      x: (nose.x + lShoulder.x) / 2,
      y: (nose.y + lShoulder.y) / 2,
      name: 'left_ear',
      estimated: true,
    });
  }

  if (nose && lShoulder && rShoulder && !map.has('right_ear')) {
    map.set('right_ear', {
      x: (nose.x + rShoulder.x) / 2,
      y: (nose.y + rShoulder.y) / 2,
      name: 'right_ear',
      estimated: true,
    });
  }

  return Array.from(map.values());
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  p1: DrawPoint,
  p2: DrawPoint,
  width: number,
) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = LINE_COLOR;
  ctx.stroke();
}

function drawJoint(
  ctx: CanvasRenderingContext2D,
  pt: DrawPoint,
  radius: number,
) {
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(204, 0, 0, 0.35)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = pt.estimated ? 'rgba(255,255,255,0.75)' : DOT_FILL;
  ctx.fill();
  ctx.strokeStyle = DOT_STROKE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function getPointMap(points: DrawPoint[]): Map<string, DrawPoint> {
  return new Map(points.map((p) => [p.name, p]));
}

export function drawPoseOverlay(
  ctx: CanvasRenderingContext2D,
  rawKeypoints: Keypoint[],
  warnings: string[],
) {
  const keypoints = normalizeKeypoints(rawKeypoints);
  const points = enrichFacePoints(keypoints);
  const pointMap = getPointMap(points);

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (points.length === 0) return;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Glow pass
  ctx.save();
  ctx.shadowColor = LINE_COLOR;
  ctx.shadowBlur = 10;
  ctx.globalAlpha = 0.85;

  for (const [a, b] of BODY_CONNECTIONS) {
    const p1 = pointMap.get(a);
    const p2 = pointMap.get(b);
    if (p1 && p2) drawLine(ctx, p1, p2, 5);
  }

  for (const [a, b] of FACE_CONNECTIONS) {
    const p1 = pointMap.get(a);
    const p2 = pointMap.get(b);
    if (p1 && p2) drawLine(ctx, p1, p2, 2.5);
  }

  ctx.restore();

  // Crisp top pass
  for (const [a, b] of BODY_CONNECTIONS) {
    const p1 = pointMap.get(a);
    const p2 = pointMap.get(b);
    if (p1 && p2) drawLine(ctx, p1, p2, 3.5);
  }

  for (const [a, b] of FACE_CONNECTIONS) {
    const p1 = pointMap.get(a);
    const p2 = pointMap.get(b);
    if (p1 && p2) drawLine(ctx, p1, p2, 2);
  }

  for (const pt of points) {
    const isFace = FACE_NAMES.has(pt.name);
    drawJoint(ctx, pt, isFace ? 5 : 7);
  }

  if (warnings.length > 0) {
    const hip = pointMap.get('left_hip') ?? pointMap.get('right_hip');
    const ankle = pointMap.get('left_ankle') ?? pointMap.get('right_ankle');

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = LINE_COLOR;
    ctx.shadowBlur = 6;

    if (warnings.includes('Forward lean') && hip) {
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(hip.x + 90, hip.y);
      ctx.stroke();
      ctx.fillStyle = LINE_COLOR;
      ctx.font = 'bold 22px Poppins, sans-serif';
      ctx.fillText('!', hip.x + 96, hip.y + 8);
    }

    if (
      (warnings.includes('Knees past toes excessively') ||
        warnings.includes('Knees drifting forward')) &&
      ankle
    ) {
      ctx.beginPath();
      ctx.moveTo(ankle.x, ankle.y);
      ctx.lineTo(ankle.x + 80, ankle.y);
      ctx.stroke();
      ctx.fillStyle = LINE_COLOR;
      ctx.font = 'bold 22px Poppins, sans-serif';
      ctx.fillText('!', ankle.x + 86, ankle.y + 8);
    }

    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  }
}

/** Count how many of the 17 COCO keypoints are visible for debug UI */
export function countVisibleKeypoints(keypoints: Keypoint[]): number {
  const normalized = normalizeKeypoints(keypoints);
  return COCO_KEYPOINTS.filter((name) => getDrawPoint(normalized, name) !== null).length;
}
