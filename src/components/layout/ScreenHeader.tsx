import { IronPathLogo } from './IronPathLogo';
import { useLiveClock } from '../../hooks/useLiveClock';

interface ScreenHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function ScreenHeader({ backLabel = 'HOME', onBack, showBack = true }: ScreenHeaderProps) {
  const time = useLiveClock();

  return (
    <header className="screen-header">
      {showBack && onBack ? (
        <button type="button" className="nav-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          {backLabel}
        </button>
      ) : (
        <span style={{ width: 72 }} />
      )}
      <IronPathLogo />
      <span className="screen-time">{time}</span>
    </header>
  );
}
