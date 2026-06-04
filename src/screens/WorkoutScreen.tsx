import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { SquatLiveTracking } from '../components/workout/SquatLiveTracking';
import '../components/workout/SquatTracker.css';
import './screens.css';

export function WorkoutScreen() {
  const { state, navigate, dispatch } = useApp();
  const { workout } = state;
  const [paused, setPaused] = useState(false);

  const trackingActive = workout.phase === 'active' && !paused;
  const showCountdown = workout.phase === 'countdown' && workout.countdown > 0;

  useEffect(() => {
    if (workout.phase !== 'countdown') return;

    const timer = setInterval(() => {
      dispatch({ type: 'TICK_COUNTDOWN' });
    }, 1000);

    return () => clearInterval(timer);
  }, [workout.phase, workout.currentSet, dispatch]);

  return (
    <>
      <ScreenHeader backLabel="HOME" onBack={() => dispatch({ type: 'FINISH_WORKOUT' })} />
      <ScreenTitle title="SQUAT" />

      <div className="workout-stage">
        <SquatLiveTracking
          paused={paused}
          trackingActive={trackingActive}
          setKey={workout.currentSet}
          showCountdown={showCountdown}
          countdownValue={workout.countdown}
        />
      </div>

      <div className="squat-controls">
        <button
          type="button"
          className="control-small"
          onClick={() => setPaused((p) => !p)}
          disabled={workout.phase !== 'active'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
          </svg>
          {paused ? 'RESUME' : 'PAUSE'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          style={{ flex: 1, maxWidth: 220 }}
          onClick={() => navigate('tutorial')}
        >
          <span className="btn-icon red">📖</span>
          TUTORIAL
        </button>

        <button
          type="button"
          className="control-small"
          onClick={() => dispatch({ type: 'FINISH_WORKOUT' })}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6V6z" />
          </svg>
          STOP
        </button>
      </div>
    </>
  );
}
