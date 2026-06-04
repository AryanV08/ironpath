import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { EXERCISE_LIST, progressScreenForExercise } from '../data/exerciseProgress';
import './screens.css';

export function ProgressScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader backLabel="HOME" onBack={() => navigate('home')} />
      <ScreenTitle title="PROGRESS" />

      <div className="progress-list">
        {EXERCISE_LIST.map((ex) => (
          <button
            key={ex.id}
            type="button"
            className="progress-card"
            onClick={() => navigate(progressScreenForExercise(ex.id))}
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
