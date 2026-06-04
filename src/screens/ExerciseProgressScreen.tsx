import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { WeightProgressChart } from '../components/progress/WeightProgressChart';
import {
  EXERCISE_PROGRESS,
  type ExerciseId,
} from '../data/exerciseProgress';
import '../components/workout/SquatTracker.css';
import './screens.css';

interface ExerciseProgressScreenProps {
  exerciseId: ExerciseId;
}

export function ExerciseProgressScreen({ exerciseId }: ExerciseProgressScreenProps) {
  const { navigate } = useApp();
  const data = EXERCISE_PROGRESS[exerciseId];

  return (
    <>
      <ScreenHeader backLabel="HOME" onBack={() => navigate('progress')} />
      <ScreenTitle title={data.name} subtitle="Progress" />

      <div className="progress-kpi-grid">
        <div>
          <div className="kpi-value green">
            {data.weight} lbs <span className="trend-up">▲</span>
          </div>
          <div className="kpi-label">WEIGHT</div>
        </div>
        <div>
          <div className="kpi-value">
            {data.repsPerWeek} <span>–</span>
          </div>
          <div className="kpi-label">REPS / WEEK</div>
        </div>
        <div>
          <div className="kpi-value green">
            {data.avgFormScore} <span className="trend-up">▲</span>
          </div>
          <div className="kpi-label">AVERAGE FORM SCORE</div>
        </div>
        <div>
          <div className="kpi-value green">
            {data.formWarnings} <span className="trend-down">▼</span>
          </div>
          <div className="kpi-label">FORM WARNING</div>
        </div>
      </div>

      <WeightProgressChart
        data={data.chartData}
        minY={data.chartMin}
        maxY={data.chartMax}
      />
    </>
  );
}
