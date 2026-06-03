import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { SquatTutorial } from '../components/tutorial/SquatTutorial';

export function TutorialScreen() {
  const { navigate } = useApp();

  return (
    <>
      <ScreenHeader backLabel="BACK TO WORKOUT" onBack={() => navigate('workout')} />
      <ScreenTitle title="SQUAT" subtitle="Tutorial" />
      <SquatTutorial />
    </>
  );
}
