export type ExerciseId = 'squat' | 'benchPress' | 'deadlift' | 'overheadPress';

export interface ExerciseProgressData {
  id: ExerciseId;
  name: string;
  weight: number;
  form: number;
  repsPerWeek: number;
  avgFormScore: number;
  formWarnings: number;
  chartData: { week: string; weight: number }[];
  chartMin: number;
  chartMax: number;
}

export const EXERCISE_PROGRESS: Record<ExerciseId, ExerciseProgressData> = {
  squat: {
    id: 'squat',
    name: 'SQUAT',
    weight: 190,
    form: 94,
    repsPerWeek: 36,
    avgFormScore: 92,
    formWarnings: 2,
    chartData: [
      { week: 'W1', weight: 172 },
      { week: 'W2', weight: 178 },
      { week: 'W3', weight: 178 },
      { week: 'W4', weight: 185 },
    ],
    chartMin: 170,
    chartMax: 190,
  },
  benchPress: {
    id: 'benchPress',
    name: 'BENCH PRESS',
    weight: 140,
    form: 92,
    repsPerWeek: 28,
    avgFormScore: 89,
    formWarnings: 4,
    chartData: [
      { week: 'W1', weight: 125 },
      { week: 'W2', weight: 130 },
      { week: 'W3', weight: 135 },
      { week: 'W4', weight: 140 },
    ],
    chartMin: 120,
    chartMax: 145,
  },
  deadlift: {
    id: 'deadlift',
    name: 'DEADLIFT',
    weight: 225,
    form: 88,
    repsPerWeek: 22,
    avgFormScore: 86,
    formWarnings: 5,
    chartData: [
      { week: 'W1', weight: 195 },
      { week: 'W2', weight: 205 },
      { week: 'W3', weight: 215 },
      { week: 'W4', weight: 225 },
    ],
    chartMin: 190,
    chartMax: 230,
  },
  overheadPress: {
    id: 'overheadPress',
    name: 'OVERHEAD PRESS',
    weight: 80,
    form: 90,
    repsPerWeek: 32,
    avgFormScore: 88,
    formWarnings: 3,
    chartData: [
      { week: 'W1', weight: 65 },
      { week: 'W2', weight: 70 },
      { week: 'W3', weight: 75 },
      { week: 'W4', weight: 80 },
    ],
    chartMin: 60,
    chartMax: 85,
  },
};

export const EXERCISE_LIST = Object.values(EXERCISE_PROGRESS);

export function exerciseIdFromName(name: string): ExerciseId | null {
  const found = EXERCISE_LIST.find((e) => e.name === name);
  return found?.id ?? null;
}

export type ProgressScreenId =
  | 'squatProgress'
  | 'benchPressProgress'
  | 'deadliftProgress'
  | 'overheadPressProgress';

export function progressScreenForExercise(id: ExerciseId): ProgressScreenId {
  const map: Record<ExerciseId, ProgressScreenId> = {
    squat: 'squatProgress',
    benchPress: 'benchPressProgress',
    deadlift: 'deadliftProgress',
    overheadPress: 'overheadPressProgress',
  };
  return map[id];
}
