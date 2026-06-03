import { useEffect, useMemo, useState } from 'react';
import './SquatTutorial.css';

interface Joint {
  x: number;
  y: number;
}

interface Pose {
  head: Joint;
  shoulder: Joint;
  elbow: Joint;
  wrist: Joint;
  hip: Joint;
  knee: Joint;
  ankle: Joint;
}

const CUES = [
  'Feet shoulder width apart',
  'Toes slightly outward (15°)',
  'Heels planted',
  'Core braced',
  'Chest up',
  'Knees track over toes',
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const keys = Object.keys(a) as (keyof Pose)[];
  const result = {} as Pose;
  for (const key of keys) {
    result[key] = {
      x: lerp(a[key].x, b[key].x, t),
      y: lerp(a[key].y, b[key].y, t),
    };
  }
  return result;
}

const standingPose: Pose = {
  head: { x: 210, y: 80 },
  shoulder: { x: 210, y: 130 },
  elbow: { x: 250, y: 155 },
  wrist: { x: 285, y: 175 },
  hip: { x: 205, y: 230 },
  knee: { x: 205, y: 310 },
  ankle: { x: 205, y: 390 },
};

const bottomPose: Pose = {
  head: { x: 240, y: 120 },
  shoulder: { x: 235, y: 165 },
  elbow: { x: 275, y: 185 },
  wrist: { x: 310, y: 200 },
  hip: { x: 215, y: 250 },
  knee: { x: 250, y: 290 },
  ankle: { x: 205, y: 390 },
};

function getAnimatedPose(progress: number): Pose {
  if (progress <= 0.35) {
    const t = easeInOutCubic(progress / 0.35);
    return lerpPose(standingPose, bottomPose, t);
  }
  if (progress <= 0.55) {
    return bottomPose;
  }
  const t = easeInOutCubic((progress - 0.55) / 0.45);
  return lerpPose(bottomPose, standingPose, t);
}

function StickFigure({ pose }: { pose: Pose }) {
  const joints = [
    pose.head,
    pose.shoulder,
    pose.hip,
    pose.knee,
    pose.ankle,
  ];

  return (
    <svg viewBox="0 0 420 440" className="tutorial-svg" aria-label="Squat tutorial animation">
      <line
        x1={pose.shoulder.x}
        y1={pose.shoulder.y}
        x2={pose.hip.x}
        y2={pose.hip.y}
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={pose.hip.x}
        y1={pose.hip.y}
        x2={pose.knee.x}
        y2={pose.knee.y}
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={pose.knee.x}
        y1={pose.knee.y}
        x2={pose.ankle.x}
        y2={pose.ankle.y}
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={pose.shoulder.x}
        y1={pose.shoulder.y}
        x2={pose.elbow.x}
        y2={pose.elbow.y}
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={pose.elbow.x}
        y1={pose.elbow.y}
        x2={pose.wrist.x}
        y2={pose.wrist.y}
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={pose.head.x}
        y1={pose.head.y}
        x2={pose.shoulder.x}
        y2={pose.shoulder.y}
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {joints.map((j, i) => (
        <circle key={i} cx={j.x} cy={j.y} r="5" fill="#111" stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

export function SquatTutorial() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 3200;

    const tick = (now: number) => {
      const elapsed = (now - start) % duration;
      setProgress(elapsed / duration);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const pose = useMemo(() => getAnimatedPose(progress), [progress]);

  return (
    <div className="tutorial-screen">
      <div className="tutorial-viewport glass-card">
        <StickFigure pose={pose} />
      </div>

      <ul className="tutorial-cues">
        {CUES.map((cue) => (
          <li key={cue} className="tutorial-cue">
            <span className="cue-pin">📍</span>
            {cue}
          </li>
        ))}
      </ul>
    </div>
  );
}
