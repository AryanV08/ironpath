import { useApp } from '../context/AppContext';
import { DEMO_PREVIOUS_SESSION } from '../data/demoPreviousSession';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import './screens.css';

export function PreviousSessionScreen() {
  const { navigate } = useApp();
  const session = DEMO_PREVIOUS_SESSION;

  const scoreClass = session.averageFormScore >= 85 ? 'good' : 'bad';
  const repDetails = session.repDetails;

  return (
    <>
      <ScreenHeader backLabel="HOME" onBack={() => navigate('home')} />
      <ScreenTitle title="PREVIOUS SESSION" subtitle={session.dateLabel} />

      <div className="summary-hero glass-card">
        <div className="summary-stat-row">
          <div>
            <div className="summary-stat-value">{session.totalReps}</div>
            <div className="summary-stat-label">TOTAL REPS</div>
          </div>
          <div>
            <div className={`summary-stat-value ${scoreClass}`}>{session.averageFormScore}</div>
            <div className="summary-stat-label">OVERALL SCORE</div>
          </div>
          <div>
            <div className="summary-stat-value">{session.sets.length}</div>
            <div className="summary-stat-label">SETS · SQUAT</div>
          </div>
        </div>
        {session.endedEarly && (
          <p className="session-note">Session ended before all sets were finished.</p>
        )}
      </div>

      <div className="summary-sets glass-card">
        <h2 className="summary-heading">Set summary</h2>
        {session.sets.map((set) => (
          <div key={set.setNumber} className="summary-set-row">
            <span className="summary-set-name">SET {set.setNumber}</span>
            <span>
              {set.repsCompleted} reps · {set.averageFormScore} avg form
            </span>
          </div>
        ))}
      </div>

      {repDetails.length > 0 && (
        <div className="rep-breakdown glass-card">
          <h2 className="summary-heading">Rep-by-rep breakdown</h2>
          <p className="session-hint">Which reps were flagged as correct vs needs work.</p>
          <div className="rep-grid">
            {repDetails.map((rep) => (
              <div
                key={`${rep.setNumber}-${rep.repNumber}`}
                className={`rep-chip ${rep.correct ? 'correct' : 'incorrect'}`}
              >
                <span className="rep-chip-label">
                  S{rep.setNumber} R{rep.repNumber}
                </span>
                <span className="rep-chip-score">{rep.formScore}</span>
                <span className="rep-chip-status">{rep.correct ? '✓' : '✕'}</span>
                {rep.note && <span className="rep-chip-note">{rep.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {session.fatigueInsight && (
        <div className="insight-card glass-card fatigue">
          <h2 className="summary-heading bad-heading">Rep fatigue detected</h2>
          <p className="insight-text">{session.fatigueInsight}</p>
        </div>
      )}

      {session.advice.length > 0 && (
        <div className="summary-section">
          <h2 className="summary-heading">How to improve next time</h2>
          <ul className="summary-list">
            {session.advice.map((tip) => (
              <li key={tip} className="summary-item good">
                <span className="summary-icon">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" className="btn-primary" onClick={() => navigate('home')}>
        BACK TO HOME
      </button>
    </>
  );
}
