import { AppProvider, useApp } from './context/AppContext';
import { MirrorBackground } from './components/layout/MirrorBackground';
import { ConnectivityBar } from './components/layout/ConnectivityBar';
import { HowItWorksScreen } from './screens/HowItWorksScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WorkoutScreen } from './screens/WorkoutScreen';
import { TutorialScreen } from './screens/TutorialScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SquatProgressScreen } from './screens/SquatProgressScreen';
import { ExerciseProgressScreen } from './screens/ExerciseProgressScreen';
import { SensorClothingScreen } from './screens/SensorClothingScreen';
import { WorkoutSummaryScreen } from './screens/WorkoutSummaryScreen';
import { PreviousSessionScreen } from './screens/PreviousSessionScreen';

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
    case 'benchPressProgress':
      return <ExerciseProgressScreen exerciseId="benchPress" />;
    case 'deadliftProgress':
      return <ExerciseProgressScreen exerciseId="deadlift" />;
    case 'overheadPressProgress':
      return <ExerciseProgressScreen exerciseId="overheadPress" />;
    case 'previousSession':
      return <PreviousSessionScreen />;
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
