import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import './screens.css';

const EXERCISES = [
  { name: 'BENCH PRESS', weight: 140, form: 92 },
  { name: 'SQUAT', weight: 190, form: 94 },
  { name: 'DEADLIFT', weight: 140, form: 88 },
  { name: 'OVERHEAD PRESS', weight: 80, form: 90 },
];

export function ProgressScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader backLabel="HOME" onBack={() => navigate('home')} />
      <ScreenTitle title="PROGRESS" />

      <div className="progress-list">
        {EXERCISES.map((ex) => (
          <button
            key={ex.name}
            type="button"
            className="progress-card"
            onClick={() => ex.name === 'SQUAT' && navigate('squatProgress')}
          >
            <div>
              <div className="progress-card-name">{ex.name}</div>
              <div className="progress-card-stat">
                {ex.weight} lbs / {ex.form} form
              </div>
            </div>
            <span className="btn-chevron">›</span>
          </button>
        ))}
      </div>

      <div className="progress-dots">
        <span className="active" />
        <span />
        <span />
      </div>
    </>
  );
}
