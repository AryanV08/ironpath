export type Screen =
  | 'howItWorks'
  | 'sensorClothing'
  | 'home'
  | 'workout'
  | 'workoutSummary'
  | 'tutorial'
  | 'progress'
  | 'squatProgress';

export type WorkoutPhase = 'idle' | 'countdown' | 'active' | 'complete';

export interface ConnectivityState {
  shirt: boolean;
  earbuds: boolean;
}

export interface SetResult {
  setNumber: number;
  repsCompleted: number;
  averageFormScore: number;
  issues: string[];
  strengths: string[];
}

export interface WorkoutSummaryData {
  totalReps: number;
  totalSets: number;
  averageFormScore: number;
  setResults: SetResult[];
  strengths: string[];
  improvements: string[];
}

export interface WorkoutState {
  exercise: string;
  phase: WorkoutPhase;
  countdown: number;
  currentSet: number;
  totalSets: number;
  repsRemaining: number;
  targetReps: number;
  formScore: number;
  setResults: SetResult[];
  summary: WorkoutSummaryData | null;
  /** Tracks issues/strengths for the current active set */
  currentSetIssues: string[];
  currentSetStrengths: string[];
  currentSetRepScores: number[];
}

export interface AppState {
  screen: Screen;
  connectivity: ConnectivityState;
  workout: WorkoutState;
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'SET_CONNECTIVITY'; device: keyof ConnectivityState; connected: boolean }
  | { type: 'UPDATE_WORKOUT'; payload: Partial<WorkoutState> }
  | { type: 'START_WORKOUT' }
  | { type: 'TICK_COUNTDOWN' }
  | { type: 'BEGIN_SET' }
  | {
      type: 'COMPLETE_REP';
      payload: { formScore: number; warnings: string[] };
    }
  | { type: 'FINISH_WORKOUT' };

const DEFAULT_WORKOUT: WorkoutState = {
  exercise: 'SQUAT',
  phase: 'idle',
  countdown: 3,
  currentSet: 1,
  totalSets: 3,
  repsRemaining: 5,
  targetReps: 5,
  formScore: 100,
  setResults: [],
  summary: null,
  currentSetIssues: [],
  currentSetStrengths: [],
  currentSetRepScores: [],
};

export const initialState: AppState = {
  screen: 'howItWorks',
  connectivity: {
    shirt: true,
    earbuds: false,
  },
  workout: { ...DEFAULT_WORKOUT },
};

const ISSUE_TO_TIP: Record<string, string> = {
  'Forward lean': 'Keep your chest up and core braced',
  'Knees drifting forward': 'Sit back into your hips before bending knees',
  'Knees caving inward': 'Drive knees outward over your toes',
  'Insufficient depth': 'Aim for hip crease below knee level',
  'Not sitting back': 'Initiate each rep by pushing hips back',
};

const STRENGTH_MESSAGES: Record<string, string> = {
  depth: 'Good squat depth',
  form: 'Strong overall form',
  clean: 'Clean reps with no major warnings',
};

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function buildSummary(workout: WorkoutState): WorkoutSummaryData {
  const allIssues = workout.setResults.flatMap((s) => s.issues);
  const issueCounts = allIssues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue] = (acc[issue] ?? 0) + 1;
    return acc;
  }, {});

  const improvements = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([issue]) => ISSUE_TO_TIP[issue] ?? issue);

  const strengths = unique(workout.setResults.flatMap((s) => s.strengths)).slice(0, 5);

  if (strengths.length === 0) {
    strengths.push('Completed the full workout');
  }

  const avgScore =
    workout.setResults.length > 0
      ? Math.round(
          workout.setResults.reduce((sum, s) => sum + s.averageFormScore, 0) /
            workout.setResults.length,
        )
      : 100;

  return {
    totalReps: workout.setResults.reduce((sum, s) => sum + s.repsCompleted, 0),
    totalSets: workout.setResults.length,
    averageFormScore: avgScore,
    setResults: workout.setResults,
    strengths,
    improvements,
  };
}

function finalizeCurrentSet(workout: WorkoutState): SetResult {
  const avgScore =
    workout.currentSetRepScores.length > 0
      ? Math.round(
          workout.currentSetRepScores.reduce((a, b) => a + b, 0) /
            workout.currentSetRepScores.length,
        )
      : workout.formScore;

  const strengths: string[] = [];
  if (avgScore >= 88) strengths.push(`${STRENGTH_MESSAGES.form} (Set ${workout.currentSet})`);
  if (workout.currentSetIssues.length === 0 && workout.currentSetRepScores.length > 0) {
    strengths.push(`${STRENGTH_MESSAGES.clean} (Set ${workout.currentSet})`);
  }
  if (workout.currentSetRepScores.some((s) => s >= 92)) {
    strengths.push(`${STRENGTH_MESSAGES.depth} on several reps`);
  }

  return {
    setNumber: workout.currentSet,
    repsCompleted: workout.currentSetRepScores.length,
    averageFormScore: avgScore,
    issues: unique(workout.currentSetIssues),
    strengths: unique(strengths),
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen };

    case 'SET_CONNECTIVITY':
      return {
        ...state,
        connectivity: {
          ...state.connectivity,
          [action.device]: action.connected,
        },
      };

    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workout: { ...state.workout, ...action.payload },
      };

    case 'START_WORKOUT':
      return {
        ...state,
        workout: {
          ...DEFAULT_WORKOUT,
          phase: 'countdown',
          countdown: 3,
          currentSet: 1,
          repsRemaining: DEFAULT_WORKOUT.targetReps,
          formScore: 100,
        },
      };

    case 'TICK_COUNTDOWN': {
      const next = state.workout.countdown - 1;
      if (next <= 0) {
        return {
          ...state,
          workout: {
            ...state.workout,
            phase: 'active',
            countdown: 0,
          },
        };
      }
      return {
        ...state,
        workout: { ...state.workout, countdown: next },
      };
    }

    case 'BEGIN_SET':
      return {
        ...state,
        workout: {
          ...state.workout,
          phase: 'countdown',
          countdown: 3,
          repsRemaining: state.workout.targetReps,
          currentSetIssues: [],
          currentSetStrengths: [],
          currentSetRepScores: [],
        },
      };

    case 'COMPLETE_REP': {
      const { formScore, warnings } = action.payload;
      const repsRemaining = Math.max(0, state.workout.repsRemaining - 1);
      const repScores = [...state.workout.currentSetRepScores, formScore];
      const issues = unique([...state.workout.currentSetIssues, ...warnings]);

      const nextWorkout: WorkoutState = {
        ...state.workout,
        repsRemaining,
        formScore,
        currentSetRepScores: repScores,
        currentSetIssues: issues,
      };

      if (repsRemaining > 0) {
        return { ...state, workout: nextWorkout };
      }

      const setResult = finalizeCurrentSet(nextWorkout);
      const setResults = [...state.workout.setResults, setResult];

      if (state.workout.currentSet < state.workout.totalSets) {
        return {
          ...state,
          workout: {
            ...nextWorkout,
            setResults,
            currentSet: state.workout.currentSet + 1,
            phase: 'countdown',
            countdown: 3,
            repsRemaining: state.workout.targetReps,
            currentSetIssues: [],
            currentSetStrengths: [],
            currentSetRepScores: [],
          },
        };
      }

      const finishedWorkout: WorkoutState = {
        ...nextWorkout,
        setResults,
        phase: 'complete',
      };

      return {
        ...state,
        screen: 'workoutSummary',
        workout: {
          ...finishedWorkout,
          summary: buildSummary(finishedWorkout),
        },
      };
    }

    case 'FINISH_WORKOUT':
      return {
        ...state,
        screen: 'home',
        workout: { ...DEFAULT_WORKOUT },
      };

    default:
      return state;
  }
}
