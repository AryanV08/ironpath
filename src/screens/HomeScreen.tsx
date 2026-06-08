import { useApp } from '../context/AppContext';
import { DEMO_PREVIOUS_SESSION } from '../data/demoPreviousSession';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import './screens.css';

export function HomeScreen() {
  const { navigate, dispatch } = useApp();
  const prev = DEMO_PREVIOUS_SESSION;

  const startWorkout = () => {
    dispatch({ type: 'START_WORKOUT' });
    navigate('workout');
  };

  return (
    <>
      <ScreenHeader showBack={false} onHelpClick={() => navigate('howItWorks')} />
      <ScreenTitle title="HOME" />

      <div className="home-actions">
        <button type="button" className="btn-primary" onClick={startWorkout}>
          <span className="btn-icon">▶</span>
          START WORKOUT
        </button>

        <div className="home-row">
          <button type="button" className="btn-secondary" onClick={() => navigate('progress')}>
            <span className="btn-icon red">📈</span>
            PROGRESS
          </button>
          <button
            type="button"
            className="btn-secondary home-session-btn"
            onClick={() => navigate('previousSession')}
          >
            <span className="btn-icon">📋</span>
            <span className="home-session-text">
              PREVIOUS SESSION
              <span className="home-session-meta">
                {prev.sets.length} sets squat · {prev.averageFormScore} overall score
              </span>
            </span>
          </button>
        </div>

        <button type="button" className="btn-secondary" onClick={() => navigate('tutorial')}>
          <span className="btn-icon red">📖</span>
          TUTORIAL
          <span className="btn-chevron">›</span>
        </button>
      </div>
    </>
  );
}
