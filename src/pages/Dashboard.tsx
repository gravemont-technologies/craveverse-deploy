import React, { Suspense, lazy } from 'react';
import MoodWrapper from '../components/MoodWrapper';
import StressSlider from '../components/StressSlider';
import VoiceInput from '../components/VoiceInput';
import EmergencyTab from '../components/EmergencyTab';
import CompetitionTab from '../components/CompetitionTab';

const Rewards = lazy(() => import('../components/Rewards'));

type DashboardProps = {
  userData: any;
  updateStress: (val: number) => void;
  onVoiceResult: (text: string) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ userData, updateStress, onVoiceResult }) => {
  return (
    <MoodWrapper stress={userData.stress} streak={userData.streak} relapse={userData.relapse}>
      <div className="p-6 flex flex-col items-center gap-6">
        <Suspense fallback={<div>Loading Rewards...</div>}>
          <Rewards
            musclePct={userData.musclePct}
            lungPct={userData.lungPct}
            wealth={userData.wealth}
            soulmateLevel={userData.soulmateLevel}
          />
        </Suspense>
        <StressSlider value={userData.stress} onChange={updateStress} />
        <VoiceInput onResult={onVoiceResult} />

        {/* Add tabs */}
        <CompetitionTab userId={userData.id} />
        <EmergencyTab userId={userData.id} />
      </div>
    </MoodWrapper>
  );
};

export default Dashboard;

