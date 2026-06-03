import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import './screens.css';

export function WorkoutSummaryScreen() {
  const { state, dispatch } = useApp();
  const summary = state.workout.summary;

  if (!summary) {
    return (
      <>
        <ScreenHeader backLabel="HOME" onBack={() => dispatch({ type: 'FINISH_WORKOUT' })} />
        <ScreenTitle title="SUMMARY" />
        <p className="summary-empty">No workout data available.</p>
        <button type="button" className="btn-primary" onClick={() => dispatch({ type: 'FINISH_WORKOUT' })}>
          BACK TO HOME
        </button>
      </>
    );
  }

  const scoreClass = summary.averageFormScore >= 85 ? 'good' : 'bad';

  return (
    <>
      <ScreenHeader showBack={false} />
      <ScreenTitle title="WORKOUT COMPLETE" subtitle="Summary" />

      <div className="summary-hero glass-card">
        <div className="summary-stat-row">
          <div>
            <div className="summary-stat-value">{summary.totalReps}</div>
            <div className="summary-stat-label">TOTAL REPS</div>
          </div>
          <div>
            <div className={`summary-stat-value ${scoreClass}`}>{summary.averageFormScore}</div>
            <div className="summary-stat-label">AVG FORM</div>
          </div>
          <div>
            <div className="summary-stat-value">{summary.totalSets}</div>
            <div className="summary-stat-label">SETS</div>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h2 className="summary-heading good-heading">What you did right</h2>
        <ul className="summary-list">
          {summary.strengths.map((item) => (
            <li key={item} className="summary-item good">
              <span className="summary-icon">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="summary-section">
        <h2 className="summary-heading bad-heading">What to improve</h2>
        {summary.improvements.length > 0 ? (
          <ul className="summary-list">
            {summary.improvements.map((item) => (
              <li key={item} className="summary-item bad">
                <span className="summary-icon">!</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="summary-empty">No major form issues detected — great work!</p>
        )}
      </div>

      <div className="summary-sets glass-card">
        <h2 className="summary-heading">Set breakdown</h2>
        {summary.setResults.map((set) => (
          <div key={set.setNumber} className="summary-set-row">
            <span className="summary-set-name">SET {set.setNumber}</span>
            <span>
              {set.repsCompleted} reps · {set.averageFormScore} form
            </span>
          </div>
        ))}
      </div>

      <button type="button" className="btn-primary" onClick={() => dispatch({ type: 'FINISH_WORKOUT' })}>
        BACK TO HOME
      </button>
    </>
  );
}
