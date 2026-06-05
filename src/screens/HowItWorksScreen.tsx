import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import ironPathShirt from '../components/layout/Iron_Path_Shirt-removebg.png';
import smartMirror from '../components/layout/mirror.png';
import ironPathEarbuds from '../components/layout/earbuds.png';
import './screens.css';

export function HowItWorksScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader showBack={false} />
      <ScreenTitle title="HOW IT WORKS" />

      <div className="how-cards">
        <div className="how-card">
          <div className="how-card-image-wrap shirt">
            <img src={ironPathShirt} alt="IronPath sensor shirt" className="how-card-image" />
          </div>
          <div className="how-card-title">SENSOR CLOTHING</div>
          <div className="how-card-desc">Tracks movement, posture, and muscle activity.</div>
          <button
            type="button"
            className="how-card-btn"
            onClick={() => navigate('sensorClothing')}
          >
            More Details
          </button>
        </div>
        <div className="how-card">
          <div className="how-card-image-wrap mirror">
            <img src={smartMirror} alt="IronPath smart mirror" className="how-card-image" />
          </div>
          <div className="how-card-title">SMART MIRROR</div>
          <div className="how-card-desc">Shows feedback, progress, recommendations and controls.</div>
        </div>
        <div className="how-card">
          <div className="how-card-image-wrap earbuds">
            <img src={ironPathEarbuds} alt="IronPath earbuds" className="how-card-image" />
          </div>
          <div className="how-card-title">EARBUDS</div>
          <div className="how-card-desc">Gives simple safety beeps during workouts.</div>
        </div>
      </div>

      <div className="home-actions">
        <button type="button" className="btn-primary" onClick={() => navigate('home')}>
          <span className="btn-icon">▶</span>
          START SETUP
          <span className="btn-chevron">›</span>
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate('home')}>
          <span className="btn-icon red">📖</span>
          SKIP TUTORIAL
          <span className="btn-chevron">›</span>
        </button>
      </div>
    </>
  );
}
