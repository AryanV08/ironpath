import { AppProvider, useApp } from './context/AppContext';
import { MirrorBackground } from './components/layout/MirrorBackground';
import { ConnectivityBar } from './components/layout/ConnectivityBar';
import { HowItWorksScreen } from './screens/HowItWorksScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WorkoutScreen } from './screens/WorkoutScreen';
import { TutorialScreen } from './screens/TutorialScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SquatProgressScreen } from './screens/SquatProgressScreen';
import { SensorClothingScreen } from './screens/SensorClothingScreen';
import { WorkoutSummaryScreen } from './screens/WorkoutSummaryScreen';

function ScreenRouter() {
  const { state } = useApp();

  switch (state.screen) {
    case 'howItWorks':
      return <HowItWorksScreen />;
    case 'sensorClothing':
      return <SensorClothingScreen />;
    case 'home':
      return <HomeScreen />;
    case 'workout':
      return <WorkoutScreen />;
    case 'workoutSummary':
      return <WorkoutSummaryScreen />;
    case 'tutorial':
      return <TutorialScreen />;
    case 'progress':
      return <ProgressScreen />;
    case 'squatProgress':
      return <SquatProgressScreen />;
    default:
      return <HowItWorksScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="mirror-app">
        <MirrorBackground />
        <main className="mirror-content">
          <div className="screen-body">
            <ScreenRouter />
          </div>
        </main>
        <ConnectivityBar />
      </div>
    </AppProvider>
  );
}
