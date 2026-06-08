import logoImage from './logo.png';

export function IronPathLogo() {
  return (
    <div className="logo-wrap">
      <div className="logo-emblem-wrap" aria-hidden="true">
        <img src={logoImage} alt="" className="logo-emblem-crop" />
      </div>
      <p className="logo-wordmark" aria-label="IronPath">
        <span className="logo-iron">Iron </span>
        <span className="logo-path">Path</span>
      </p>
    </div>
  );
}
