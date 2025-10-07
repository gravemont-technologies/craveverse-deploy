// src/pages/Dashboard.tsx
import React, { Suspense, lazy } from "react";
import MoodWrapper from "../components/MoodWrapper";
import StressSlider from "../components/StressSlider";
import VoiceInput from "../components/VoiceInput";
import EmergencyTab from "../components/EmergencyTab";
import CompetitionTab from "../components/CompetitionTab";
import TipsForum from "../components/TipsForum";
import Projections from "../components/Projections";
import { useUpdateHabit } from "../hooks/useUpdateHabit";

const Rewards = lazy(() => import("../components/Rewards"));

type DashboardProps = {
  userData: any; // { id, stress, streak, relapse, musclePct ... }
  updateStress: (val: number) => void;
  onVoiceResult: (text: string) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ userData, updateStress, onVoiceResult }) => {
  const { updateHabit } = useUpdateHabit(userData.id);

  const handleResistHabit = async (habit: string) => {
    try {
      await updateHabit(habit, { resisted: true, coins_delta: 10, streak_delta: 1 });
      // optimistic UI update can be done here
    } catch (err) {
      console.error("Failed to update habit", err);
    }
  };

  const handleRelapseHabit = async (habit: string) => {
    try {
      await updateHabit(habit, { relapsed: true, coins_delta: -5, streak_delta: -1 });
    } catch (err) {
      console.error("Failed to record relapse", err);
    }
  };

  return (
    <MoodWrapper stress={userData.stress} streak={userData.streak} relapse={userData.relapse}>
      <div className="p-6 flex flex-col items-center gap-6">
        <Suspense fallback={<div>Loading Rewards...</div>}>
          <Rewards userId={userData.id} habitType={userData.currentCraving} />
        </Suspense>
        <StressSlider value={userData.stress} onChange={updateStress} />
        <VoiceInput onResult={onVoiceResult} />

        <CompetitionTab userId={userData.id} />
        <EmergencyTab userId={userData.id} />
        <TipsForum userId={userData.id} />
        <Projections userId={userData.id} />
      </div>
    </MoodWrapper>
  );
};

export default Dashboard;



