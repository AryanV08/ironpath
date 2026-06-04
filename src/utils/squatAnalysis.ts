export interface Point {
  x: number;
  y: number;
  score?: number;
}

export interface SquatAngles {
  knee: number;
  hip: number;
  torsoLean: number;
  depth: number;
  hipDrop: number;
  kneeSpread: number;
}

export interface FormFeedback {
  messages: string[];
  warnings: string[];
  score: number;
  isGood: boolean;
  showBadge: boolean;
}

export type SquatPhase = 'standing' | 'descending' | 'bottom' | 'ascending';

export interface SquatBaseline {
  hipY: number;
  kneeAngle: number;
  torsoLength: number;
  ankleWidth: number;
  kneeWidth: number;
  hipAnkleSpan: number;
  samples: number;
}

export interface RepTrackerState {
  phase: SquatPhase;
  repCount: number;
  depthReached: boolean;
  currentRepScores: number[];
  currentRepWarnings: string[];
  completedRepScores: number[];
  sessionScore: number;
  liveScore: number;
}

export interface RepCompletionEvent {
  formScore: number;
  warnings: string[];
}

const MIN_KEYPOINT_SCORE = 0.12;
export const CALIBRATION_FRAMES = 1;

const TH = {
  kneeBendMin: 18,
  kneeDeep: 138,
  kneeShallow: 152,
  hipDropSquat: 0.05,
  hipDropDeep: 0.1,
  valgusMax: 0.18,
  leanMax: 35,
};

export function createBaseline(): SquatBaseline {
  return {
    hipY: 0,
    kneeAngle: 170,
    torsoLength: 1,
    ankleWidth: 1,
    kneeWidth: 1,
    hipAnkleSpan: 1,
    samples: 0,
  };
}

export function angleBetween(a: Point, b: Point, c: Point): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAb = Math.hypot(ab.x, ab.y);
  const magCb = Math.hypot(cb.x, cb.y);
  if (magAb === 0 || magCb === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function getKeypoint(
  keypoints: { name?: string; x: number; y: number; score?: number }[],
  name: string,
  minScore = MIN_KEYPOINT_SCORE,
): Point | null {
  const kp = keypoints.find((k) => k.name === name);
  if (!kp || (kp.score !== undefined && kp.score < minScore)) return null;
  return { x: kp.x, y: kp.y, score: kp.score };
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function computeSquatMetrics(
  keypoints: { name?: string; x: number; y: number; score?: number }[],
  baseline?: SquatBaseline | null,
): SquatAngles | null {
  const lHip = getKeypoint(keypoints, 'left_hip');
  const rHip = getKeypoint(keypoints, 'right_hip');
  const lKnee = getKeypoint(keypoints, 'left_knee');
  const rKnee = getKeypoint(keypoints, 'right_knee');
  const lAnkle = getKeypoint(keypoints, 'left_ankle');
  const rAnkle = getKeypoint(keypoints, 'right_ankle');
  const lShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rShoulder = getKeypoint(keypoints, 'right_shoulder');

  if (!lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) return null;

  const knee = (angleBetween(lHip, lKnee, lAnkle) + angleBetween(rHip, rKnee, rAnkle)) / 2;

  const midHip = midpoint(lHip, rHip);
  const midAnkle = midpoint(lAnkle, rAnkle);
  const hipAnkleSpan = Math.max(midAnkle.y - midHip.y, 1);

  const refHipY = baseline?.samples ? baseline.hipY : midHip.y;
  const refSpan = baseline?.samples ? baseline.hipAnkleSpan : hipAnkleSpan;
  const hipDrop = Math.max(0, (midHip.y - refHipY) / Math.max(refSpan, 1));

  const kneeWidth = distance(lKnee, rKnee);
  const ankleWidth = Math.max(distance(lAnkle, rAnkle), 1);

  let torsoLean = 0;
  if (lShoulder && rShoulder) {
    const midShoulder = midpoint(lShoulder, rShoulder);
    torsoLean = Math.abs(
      (Math.atan2(midShoulder.x - midHip.x, -(midShoulder.y - midHip.y)) * 180) / Math.PI,
    );
  }

  return {
    knee,
    hip: knee,
    torsoLean,
    depth: 180 - knee,
    hipDrop,
    kneeSpread: kneeWidth / ankleWidth,
  };
}

export function updateBaseline(
  baseline: SquatBaseline,
  angles: SquatAngles,
  keypoints: { name?: string; x: number; y: number; score?: number }[],
): SquatBaseline {
  const lHip = getKeypoint(keypoints, 'left_hip');
  const rHip = getKeypoint(keypoints, 'right_hip');
  const lShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rShoulder = getKeypoint(keypoints, 'right_shoulder');
  const lKnee = getKeypoint(keypoints, 'left_knee');
  const rKnee = getKeypoint(keypoints, 'right_knee');
  const lAnkle = getKeypoint(keypoints, 'left_ankle');
  const rAnkle = getKeypoint(keypoints, 'right_ankle');

  if (!lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) return baseline;

  const midHip = midpoint(lHip, rHip);
  const midShoulder =
    lShoulder && rShoulder ? midpoint(lShoulder, rShoulder) : midHip;

  const n = baseline.samples + 1;
  const newKnee = (baseline.kneeAngle * baseline.samples + angles.knee) / n;

  return {
    hipY: (baseline.hipY * baseline.samples + midHip.y) / n,
    kneeAngle: Math.max(newKnee, angles.knee),
    torsoLength:
      (baseline.torsoLength * baseline.samples + distance(midShoulder, midHip)) / n,
    ankleWidth: (baseline.ankleWidth * baseline.samples + distance(lAnkle, rAnkle)) / n,
    kneeWidth: (baseline.kneeWidth * baseline.samples + distance(lKnee, rKnee)) / n,
    hipAnkleSpan:
      (baseline.hipAnkleSpan * baseline.samples +
        Math.max(midpoint(lAnkle, rAnkle).y - midHip.y, 1)) /
      n,
    samples: Math.max(n, CALIBRATION_FRAMES),
  };
}

export function isCalibrated(baseline: SquatBaseline): boolean {
  return baseline.samples >= CALIBRATION_FRAMES;
}

function isActiveSquatPhase(phase: SquatPhase): boolean {
  return phase === 'descending' || phase === 'bottom' || phase === 'ascending';
}

/** Knee bent relative to calibrated standing angle */
export function getKneeBend(angles: SquatAngles, baseline: SquatBaseline | null): number {
  if (!baseline?.samples) return 0;
  return baseline.kneeAngle - angles.knee;
}

export function isUserSquatting(
  angles: SquatAngles,
  phase: SquatPhase,
  baseline: SquatBaseline | null,
): boolean {
  if (isActiveSquatPhase(phase)) return true;
  if (!baseline?.samples) return angles.knee < 155;
  const bend = getKneeBend(angles, baseline);
  return bend >= TH.kneeBendMin || angles.hipDrop >= TH.hipDropSquat;
}

export function analyzeForm(
  angles: SquatAngles,
  phase: SquatPhase,
  calibrated: boolean,
  baseline?: SquatBaseline | null,
): FormFeedback {
  if (!calibrated) {
    return {
      warnings: [],
      messages: ['Detecting pose…'],
      score: 100,
      isGood: false,
      showBadge: false,
    };
  }

  if (!isUserSquatting(angles, phase, baseline ?? null)) {
    return {
      warnings: [],
      messages: ['Squat down — form check starts as you descend'],
      score: 100,
      isGood: false,
      showBadge: false,
    };
  }

  const warnings: string[] = [];
  const messages: string[] = [];
  let score = 92;

  const kneeBend = getKneeBend(angles, baseline ?? null);
  const deepEnough =
    angles.knee <= TH.kneeDeep ||
    kneeBend >= 35 ||
    angles.hipDrop >= TH.hipDropDeep ||
    phase === 'bottom';

  const shallow =
    angles.knee > TH.kneeShallow && kneeBend < 22 && angles.hipDrop < TH.hipDropDeep;

  if (shallow) {
    return {
      warnings: ['Insufficient depth'],
      messages: ['Sit lower'],
      score: 68,
      isGood: false,
      showBadge: true,
    };
  }

  if (!deepEnough && (phase === 'descending' || phase === 'ascending')) {
    return {
      warnings: [],
      messages: ['Keep going down…'],
      score: 85,
      isGood: false,
      showBadge: true,
    };
  }

  if (angles.kneeSpread < 1 - TH.valgusMax) {
    warnings.push('Knees caving inward');
    messages.push('Push knees out');
    score -= 14;
  }

  if (angles.torsoLean > TH.leanMax && deepEnough) {
    warnings.push('Forward lean');
    messages.push('Chest up');
    score -= 12;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    messages,
    warnings: [...new Set(warnings)],
    score,
    isGood: score >= 75 && warnings.length === 0,
    showBadge: true,
  };
}

export function createRepTracker(): RepTrackerState {
  return {
    phase: 'standing',
    repCount: 0,
    depthReached: false,
    currentRepScores: [],
    currentRepWarnings: [],
    completedRepScores: [],
    sessionScore: 100,
    liveScore: 100,
  };
}

function average(nums: number[]): number {
  if (nums.length === 0) return 100;
  return Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length);
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function isAtBottom(angles: SquatAngles, baseline: SquatBaseline | null): boolean {
  const bend = getKneeBend(angles, baseline);
  return (
    angles.knee <= TH.kneeDeep ||
    bend >= 28 ||
    angles.hipDrop >= TH.hipDropDeep
  );
}

function isAtTop(angles: SquatAngles, baseline: SquatBaseline | null): boolean {
  if (!baseline?.samples) return angles.knee >= 155;
  const bend = getKneeBend(angles, baseline);
  return bend < 12 && angles.hipDrop <= TH.hipDropSquat;
}

function isDescending(
  angles: SquatAngles,
  phase: SquatPhase,
  baseline: SquatBaseline | null,
): boolean {
  if (phase !== 'standing') return false;
  if (!baseline?.samples) return angles.knee < 155;
  return getKneeBend(angles, baseline) >= 10 || angles.hipDrop >= 0.04;
}

export function updateRepTracker(
  tracker: RepTrackerState,
  angles: SquatAngles,
  frameScore: number,
  frameWarnings: string[],
  calibrated: boolean,
  baseline: SquatBaseline | null,
): { tracker: RepTrackerState; repCompleted: RepCompletionEvent | null } {
  if (!calibrated) return { tracker, repCompleted: null };

  const next: RepTrackerState = {
    ...tracker,
    currentRepScores: [...tracker.currentRepScores],
    currentRepWarnings: [...tracker.currentRepWarnings],
  };

  let phase = tracker.phase;
  let depthReached = tracker.depthReached;
  let repCompleted: RepCompletionEvent | null = null;

  if (isAtTop(angles, baseline)) {
    if ((phase === 'ascending' || phase === 'bottom') && depthReached) {
      const formScore = average(next.currentRepScores);
      const warnings = unique(next.currentRepWarnings);
      repCompleted = { formScore, warnings };
      next.completedRepScores = [...next.completedRepScores, formScore];
      next.repCount = tracker.repCount + 1;
      next.currentRepScores = [];
      next.currentRepWarnings = [];
      depthReached = false;
    }
    phase = 'standing';
  } else if (phase === 'bottom' && getKneeBend(angles, baseline) < 15) {
    phase = 'ascending';
    next.currentRepScores.push(frameScore);
    next.currentRepWarnings.push(...frameWarnings);
  } else if (isAtBottom(angles, baseline)) {
    phase = 'bottom';
    depthReached = true;
    next.currentRepScores.push(frameScore);
    next.currentRepWarnings.push(...frameWarnings);
  } else if (phase === 'ascending') {
    next.currentRepScores.push(frameScore);
    next.currentRepWarnings.push(...frameWarnings);
  } else if (isDescending(angles, phase, baseline)) {
    phase = 'descending';
  }

  next.phase = phase;
  next.depthReached = depthReached;
  next.sessionScore =
    next.completedRepScores.length > 0 ? average(next.completedRepScores) : 100;
  next.liveScore =
    next.currentRepScores.length > 0
      ? average(next.currentRepScores)
      : next.sessionScore;

  return { tracker: next, repCompleted };
}

export function getDisplayScore(tracker: RepTrackerState, liveFrameScore: number): number {
  if (isActiveSquatPhase(tracker.phase) && tracker.currentRepScores.length > 0) {
    return tracker.liveScore;
  }
  if (tracker.completedRepScores.length === 0) {
    return liveFrameScore;
  }
  return tracker.sessionScore;
}

export function getPhaseLabel(phase: SquatPhase): string {
  switch (phase) {
    case 'standing':
      return 'Standing';
    case 'descending':
      return 'Descending';
    case 'bottom':
      return 'Bottom';
    case 'ascending':
      return 'Ascending';
  }
}
