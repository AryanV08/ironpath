import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import './screens.css';

const SENSOR_POSITIONS = [
  { top: '18%', left: '35%' },
  { top: '18%', right: '35%' },
  { top: '38%', left: '50%', transform: 'translateX(-50%)' },
  { top: '52%', left: '30%' },
  { top: '52%', right: '30%' },
  { top: '68%', left: '50%', transform: 'translateX(-50%)' },
];

export function SensorClothingScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader backLabel="BACK" onBack={() => navigate('howItWorks')} />
      <ScreenTitle title="SENSOR CLOTHING" />

      <div className="sensor-screen">
        <div className="sensor-visual">
          <div className="sensor-shirt">
            {SENSOR_POSITIONS.map((pos, i) => (
              <span key={i} className="sensor-dot" style={pos} />
            ))}
          </div>
        </div>

        <h2 className="sensor-heading">EMBEDDED ELECTRODES</h2>
        <p className="sensor-desc">
          Conductive electrodes are seamlessly embedded in the fabric to monitor muscle
          activity and performance.
        </p>

        <div className="sensor-features">
          <div className="sensor-feature">
            <span className="check-icon">✓</span> REAL-TIME MUSCLE DATA
          </div>
          <div className="sensor-feature">
            <span className="check-icon">✓</span> OPTIMIZE PERFORMANCE
          </div>
          <div className="sensor-feature">
            <span className="check-icon">✓</span> ULTRA-LIGHT &amp; COMFORTABLE
          </div>
        </div>
      </div>
    </>
  );
}
