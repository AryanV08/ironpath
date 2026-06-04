import type { PreviousSession, RepDetail } from '../types/navigation';

export interface PreviousSessionDetail extends PreviousSession {
  repDetails: RepDetail[];
  fatigueInsight: string;
  advice: string[];
}

/** Fixed demo session — always shown for Previous Session (not overwritten by live workouts). */
export const DEMO_PREVIOUS_SESSION: PreviousSessionDetail = {
  dateISO: '2026-06-01T18:30:00.000Z',
  dateLabel: 'Yesterday · 3 sets squat · 88 overall',
  exercise: 'SQUAT',
  totalReps: 15,
  averageFormScore: 88,
  endedEarly: false,
  sets: [
    { setNumber: 1, repsCompleted: 5, targetReps: 5, averageFormScore: 94 },
    { setNumber: 2, repsCompleted: 5, targetReps: 5, averageFormScore: 90 },
    { setNumber: 3, repsCompleted: 5, targetReps: 5, averageFormScore: 81 },
  ],
  repDetails: [
    { setNumber: 1, repNumber: 1, formScore: 96, correct: true },
    { setNumber: 1, repNumber: 2, formScore: 95, correct: true },
    { setNumber: 1, repNumber: 3, formScore: 93, correct: true },
    { setNumber: 1, repNumber: 4, formScore: 94, correct: true },
    { setNumber: 1, repNumber: 5, formScore: 92, correct: true },
    { setNumber: 2, repNumber: 1, formScore: 93, correct: true },
    { setNumber: 2, repNumber: 2, formScore: 91, correct: true },
    { setNumber: 2, repNumber: 3, formScore: 89, correct: true },
    { setNumber: 2, repNumber: 4, formScore: 88, correct: true, note: 'Slight forward lean' },
    { setNumber: 2, repNumber: 5, formScore: 89, correct: true },
    { setNumber: 3, repNumber: 1, formScore: 88, correct: true },
    { setNumber: 3, repNumber: 2, formScore: 85, correct: true, note: 'Depth shortened' },
    { setNumber: 3, repNumber: 3, formScore: 82, correct: false, note: 'Knees drifted forward' },
    { setNumber: 3, repNumber: 4, formScore: 78, correct: false, note: 'Fatigue — form broke down' },
    { setNumber: 3, repNumber: 5, formScore: 72, correct: false, note: 'Fatigue — chest dropped' },
  ],
  fatigueInsight:
    'Form scores dropped 12+ points on the last two reps of Set 3. That pattern usually means muscular fatigue or rushing the ascent.',
  advice: [
    'Rest 90–120 seconds between sets to keep late-rep form sharp.',
    'Brace your core before each descent and keep your chest proud at the bottom.',
    'On Set 3, consider reducing load slightly or pausing 1 second at the bottom for control.',
    'Focus on sitting hips back first — your last reps showed forward knee drift.',
  ],
};

export function isDetailedSession(
  session: PreviousSession | null,
): session is PreviousSessionDetail {
  return session !== null && 'repDetails' in session && Array.isArray(session.repDetails);
}
