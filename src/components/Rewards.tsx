import React, { useMemo } from 'react';
import { animated, useSpring } from '@react-spring/web';

type RewardProps = {
  musclePct: number;
  lungPct: number;
  wealth: number;
  soulmateLevel: number;
};

const Rewards: React.FC<RewardProps> = ({ musclePct, lungPct, wealth, soulmateLevel }) => {
  // Smooth morphing animation
  const muscleSpring = useSpring({ width: musclePct * 200, config: { tension: 120, friction: 14 } });
  const lungSpring = useSpring({ opacity: lungPct, config: { tension: 120, friction: 14 } });
  const wealthSpring = useSpring({ transform: `scale(${0.5 + wealth / 1000})`, config: { tension: 120 } });
  const soulmateSpring = useSpring({ opacity: soulmateLevel, config: { tension: 120, friction: 14 } });

  return (
    <div className="flex gap-6 justify-center p-4">
      <animated.div style={muscleSpring} className="reward-svg bg-red-500 rounded-md w-12 h-48"></animated.div>
      <animated.div style={lungSpring} className="reward-svg bg-blue-500 rounded-md w-12 h-48"></animated.div>
      <animated.div style={wealthSpring} className="reward-svg bg-yellow-500 rounded-md w-12 h-48"></animated.div>
      <animated.div style={soulmateSpring} className="reward-svg bg-purple-500 rounded-md w-12 h-48"></animated.div>
    </div>
  );
};

export default React.memo(Rewards);
