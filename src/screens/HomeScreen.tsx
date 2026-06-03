import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import './screens.css';

export function HomeScreen() {
  const { navigate, dispatch } = useApp();

  const startWorkout = () => {
    dispatch({ type: 'START_WORKOUT' });
    navigate('workout');
  };

  return (
    <>
      <ScreenHeader showBack={false} />
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
          <button type="button" className="btn-secondary" onClick={() => navigate('progress')}>
            <span className="btn-icon">📋</span>
            HISTORY
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
