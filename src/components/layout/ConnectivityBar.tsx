import { useApp } from '../../context/AppContext';

export function ConnectivityBar() {
  const { state } = useApp();
  const { shirt, earbuds } = state.connectivity;

  return (
    <footer className="connectivity-bar">
      <div className="connectivity-item">
        <span className={`status-dot ${shirt ? 'connected' : 'disconnected'}`} />
        SHIRT
      </div>
      <div className="connectivity-item">
        <span className={`status-dot ${earbuds ? 'connected' : 'disconnected'}`} />
        EARBUDS
      </div>
    </footer>
  );
}
