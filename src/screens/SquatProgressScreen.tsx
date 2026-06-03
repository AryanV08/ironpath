import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { WeightProgressChart } from '../components/progress/WeightProgressChart';
import '../components/workout/SquatTracker.css';
import './screens.css';

export function SquatProgressScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader backLabel="HOME" onBack={() => navigate('progress')} />
      <ScreenTitle title="SQUAT" subtitle="Progress" />

      <div className="progress-kpi-grid">
        <div>
          <div className="kpi-value green">
            190 lbs <span className="trend-up">▲</span>
          </div>
          <div className="kpi-label">WEIGHT</div>
        </div>
        <div>
          <div className="kpi-value">36 –</div>
          <div className="kpi-label">REPS / WEEK</div>
        </div>
        <div>
          <div className="kpi-value green">
            92 <span className="trend-up">▲</span>
          </div>
          <div className="kpi-label">AVERAGE FORM SCORE</div>
        </div>
        <div>
          <div className="kpi-value green">
            2 <span className="trend-down">▼</span>
          </div>
          <div className="kpi-label">FORM WARNING</div>
        </div>
      </div>

      <WeightProgressChart />
    </>
  );
}
