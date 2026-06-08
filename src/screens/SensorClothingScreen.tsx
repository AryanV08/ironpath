import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import moreDetailsPage from '../components/layout/more_details_page.png';
import './screens.css';

/**
 * Content from more_details_page.png — top (header/time/title) cropped off,
 * dark gym background removed via blend so mirror-bg shows through.
 */
export function SensorClothingScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader
        backLabel="HOME"
        showTime={false}
        onBack={() => navigate('howItWorks')}
      />
      <ScreenTitle title="SENSOR CLOTHING" />

      <div className="sensor-details-page">
        <div className="sensor-details-crop">
          <img
            src={moreDetailsPage}
            alt="Sensor clothing with embedded electrodes"
            className="sensor-details-reference"
          />
        </div>
      </div>
    </>
  );
}
