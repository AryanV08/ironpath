import { IronPathLogo } from './IronPathLogo';
import { useLiveClock } from '../../hooks/useLiveClock';

interface ScreenHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  showBack?: boolean;
  showTime?: boolean;
  onHelpClick?: () => void;
}

export function ScreenHeader({
  backLabel = 'HOME',
  onBack,
  showBack = true,
  showTime = true,
  onHelpClick,
}: ScreenHeaderProps) {
  const time = useLiveClock();

  const leftSlot = showBack && onBack ? (
    <button type="button" className="nav-back" onClick={onBack}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
      {backLabel}
    </button>
  ) : onHelpClick ? (
    <button
      type="button"
      className="nav-help"
      onClick={onHelpClick}
      aria-label="How it works"
    >
      ?
    </button>
  ) : (
    <span className="screen-header-spacer" aria-hidden="true" />
  );

  return (
    <header className="screen-header">
      {leftSlot}
      <IronPathLogo />
      {showTime ? (
        <span className="screen-time">{time}</span>
      ) : (
        <span className="screen-header-spacer" aria-hidden="true" />
      )}
    </header>
  );
}
