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

const MIN_KEYPOINT_SCORE = 0.2;
const CALIBRATION_FRAMES = 20;

/** Thresholds tuned for front-facing webcam (more lenient than side view) */
const TH = {
  standKneeMin: 148,
  standHipDropMax: 0.1,
  descendKneeMax: 142,
  descendHipDropMin: 0.06,
  bottomKneeMax: 135,
  bottomHipDropMin: 0.16,
  ascendKneeMin: 128,
  // Form (only scored during bottom / ascending)
  depthHipDropGood: 0.2,
  depthKneeGood: 138,
  valgusMax: 0.22,
  leanMax: 28,
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

  const leftKnee = angleBetween(lHip, lKnee, lAnkle);
  const rightKnee = angleBetween(rHip, rKnee, rAnkle);
  const knee = (leftKnee + rightKnee) / 2;

  const midHip = midpoint(lHip, rHip);
  const midAnkle = midpoint(lAnkle, rAnkle);
  const hipAnkleSpan = Math.max(midAnkle.y - midHip.y, 1);

  const hipDrop =
    baseline?.samples && baseline.hipAnkleSpan > 0
      ? Math.max(0, (midHip.y - baseline.hipY) / baseline.hipAnkleSpan)
      : 0;

  const kneeWidth = distance(lKnee, rKnee);
  const ankleWidth = Math.max(distance(lAnkle, rAnkle), 1);
  const kneeSpread = kneeWidth / ankleWidth;

  let torsoLean = 0;
  if (lShoulder && rShoulder) {
    const midShoulder = midpoint(lShoulder, rShoulder);
    torsoLean = Math.abs(
      (Math.atan2(midShoulder.x - midHip.x, -(midShoulder.y - midHip.y)) * 180) / Math.PI,
    );
  }

  const hip =
    lShoulder && rShoulder
      ? angleBetween(midpoint(lShoulder, rShoulder), midHip, midpoint(lKnee, rKnee))
      : (angleBetween(lHip, lKnee, lAnkle) + angleBetween(rHip, rKnee, rAnkle)) / 2;

  return {
    knee,
    hip,
    torsoLean,
    depth: 180 - knee,
    hipDrop,
    kneeSpread,
  };
}

export function updateBaseline(
  baseline: SquatBaseline,
  angles: SquatAngles,
  keypoints: { name?: string; x: number; y: number; score?: number }[],
): SquatBaseline {
  if (angles.knee > TH.standKneeMin && angles.hipDrop < TH.standHipDropMax) {
    const lHip = getKeypoint(keypoints, 'left_hip');
    const rHip = getKeypoint(keypoints, 'right_hip');
    const lShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rShoulder = getKeypoint(keypoints, 'right_shoulder');
    const lKnee = getKeypoint(keypoints, 'left_knee');
    const rKnee = getKeypoint(keypoints, 'right_knee');
    const lAnkle = getKeypoint(keypoints, 'left_ankle');
    const rAnkle = getKeypoint(keypoints, 'right_ankle');

    if (lHip && rHip && lShoulder && rShoulder && lKnee && rKnee && lAnkle && rAnkle) {
      const midHip = midpoint(lHip, rHip);
      const midShoulder = midpoint(lShoulder, rShoulder);
      const n = baseline.samples + 1;

      return {
        hipY: (baseline.hipY * baseline.samples + midHip.y) / n,
        kneeAngle: (baseline.kneeAngle * baseline.samples + angles.knee) / n,
        torsoLength:
          (baseline.torsoLength * baseline.samples + distance(midShoulder, midHip)) / n,
        ankleWidth:
          (baseline.ankleWidth * baseline.samples + distance(lAnkle, rAnkle)) / n,
        kneeWidth: (baseline.kneeWidth * baseline.samples + distance(lKnee, rKnee)) / n,
        hipAnkleSpan:
          (baseline.hipAnkleSpan * baseline.samples +
            Math.max(midpoint(lAnkle, rAnkle).y - midHip.y, 1)) /
          n,
        samples: n,
      };
    }
  }

  return baseline;
}

export function isCalibrated(baseline: SquatBaseline): boolean {
  return baseline.samples >= CALIBRATION_FRAMES;
}

function isActiveSquatPhase(phase: SquatPhase): boolean {
  return phase === 'descending' || phase === 'bottom' || phase === 'ascending';
}

export function analyzeForm(
  angles: SquatAngles,
  phase: SquatPhase,
  calibrated: boolean,
): FormFeedback {
  if (!calibrated) {
    return {
      warnings: ['Hold still — calibrating…'],
      messages: ['Stand naturally facing the camera'],
      score: 100,
      isGood: false,
      showBadge: false,
    };
  }

  if (phase === 'standing') {
    return {
      warnings: [],
      messages: ['Ready — squat when set is active'],
      score: 100,
      isGood: false,
      showBadge: false,
    };
  }

  if (!isActiveSquatPhase(phase)) {
    return {
      warnings: [],
      messages: [],
      score: 100,
      isGood: false,
      showBadge: false,
    };
  }

  const warnings: string[] = [];
  const messages: string[] = [];
  let score = 100;

  // Only apply strict checks near/at the bottom of the movement
  const scoreForm = phase === 'bottom' || (phase === 'ascending' && angles.hipDrop > 0.12);

  if (!scoreForm) {
    return {
      warnings: [],
      messages: ['Keep going down…'],
      score: 100,
      isGood: false,
      showBadge: true,
    };
  }

  const depthOk =
    angles.hipDrop >= TH.depthHipDropGood || angles.knee <= TH.depthKneeGood;

  if (!depthOk) {
    warnings.push('Insufficient depth');
    messages.push('Sit lower');
    score -= 15;
  }

  if (angles.kneeSpread < 1 - TH.valgusMax) {
    warnings.push('Knees caving inward');
    messages.push('Push knees out');
    score -= 12;
  }

  if (angles.torsoLean > TH.leanMax && angles.hipDrop > 0.14) {
    warnings.push('Forward lean');
    messages.push('Chest up');
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    messages,
    warnings: [...new Set(warnings)],
    score,
    isGood: score >= 78 && warnings.length === 0,
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

function isAtBottom(angles: SquatAngles): boolean {
  return (
    angles.knee <= TH.bottomKneeMax ||
    angles.hipDrop >= TH.bottomHipDropMin
  );
}

function isAtTop(angles: SquatAngles): boolean {
  return angles.knee >= TH.standKneeMin && angles.hipDrop <= TH.standHipDropMax;
}

function isDescending(angles: SquatAngles, phase: SquatPhase): boolean {
  return (
    phase === 'standing' &&
    (angles.knee <= TH.descendKneeMax || angles.hipDrop >= TH.descendHipDropMin)
  );
}

export function updateRepTracker(
  tracker: RepTrackerState,
  angles: SquatAngles,
  frameScore: number,
  frameWarnings: string[],
  calibrated: boolean,
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

  if (isAtTop(angles)) {
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
  } else if (phase === 'bottom' && angles.knee >= TH.ascendKneeMin) {
    phase = 'ascending';
    next.currentRepScores.push(frameScore);
    next.currentRepWarnings.push(...frameWarnings);
  } else if (isAtBottom(angles)) {
    phase = 'bottom';
    depthReached = true;
    next.currentRepScores.push(frameScore);
    next.currentRepWarnings.push(...frameWarnings);
  } else if (phase === 'ascending') {
    next.currentRepScores.push(frameScore);
    next.currentRepWarnings.push(...frameWarnings);
  } else if (isDescending(angles, phase)) {
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
