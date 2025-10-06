import React, { Suspense, lazy } from 'react'; 
import MoodWrapper from '../components/MoodWrapper';
import StressSlider from '../components/StressSlider';
import VoiceInput from '../components/VoiceInput';
import EmergencyTab from '../components/EmergencyTab';
import CompetitionTab from '../components/CompetitionTab';
import TipsForum from '../components/TipsForum';
import Projections from '../components/Projections';
import { useUpdateHabit } from '../hooks/useUpdateHabit';

const Rewards = lazy(() => import('../components/Rewards'));

type DashboardProps = {
  userData: any;
  updateStress: (val: number) => void;
  onVoiceResult: (text: string) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ userData, updateStress, onVoiceResult }) => {
  const { updateHabit } = useUpdateHabit(userData.id);

  // Example function to handle a habit resist
  const handleResistHabit = async (habit: string) => {
    try {
      await updateHabit(habit, { resisted: true });
      console.log(`${habit} resisted successfully!`);
    } catch (err) {
      console.error('Failed to update habit', err);
    }
  };

  // Example function to handle a habit relapse
  const handleRelapseHabit = async (habit: string) => {
    try {
      await updateHabit(habit, { resisted: false, relapsed: true });
      console.log(`${habit} relapse recorded.`);
    } catch (err) {
      console.error('Failed to update habit', err);
    }
  };

  return (
    <MoodWrapper stress={userData.stress} streak={userData.streak} relapse={userData.relapse}>
      <div className="p-6 flex flex-col items-center gap-6">
        <Suspense fallback={<div>Loading Rewards...</div>}>
          <Rewards
            musclePct={userData.musclePct}
            lungPct={userData.lungPct}
            wealth={userData.wealth}
            soulmateLevel={userData.soulmateLevel}
            onResist={(habit: string) => handleResistHabit(habit)}
            onRelapse={(habit: string) => handleRelapseHabit(habit)}
          />
        </Suspense>

        <StressSlider value={userData.stress} onChange={updateStress} />
        <VoiceInput onResult={onVoiceResult} />

        <CompetitionTab userId={userData.id} />
        <EmergencyTab userId={userData.id} />
        <TipsForum userId={userData.id} />
        <Projections
          musclePct={userData.musclePct}
          lungPct={userData.lungPct}
          wealth={userData.wealth}
          day={userData.day}
        />
      </div>
    </MoodWrapper>
  );
};

export default Dashboard;



