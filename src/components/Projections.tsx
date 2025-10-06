import React from 'react';
import { animated, useSpring } from '@react-spring/web';

type ProjectionsProps = {
  musclePct: number;
  lungPct: number;
  wealth: number;
  day: number;
};

const Projections: React.FC<ProjectionsProps> = ({ musclePct, lungPct, wealth, day }) => {
  const muscleAnim = useSpring({ width: musclePct * 200 });
  const lungAnim = useSpring({ width: lungPct * 200 });
  const wealthAnim = useSpring({ width: wealth / 10 });

  return (
    <div className="flex gap-4 p-4">
      <div className="flex flex-col items-center">
        <span>Muscle</span>
        <animated.div style={muscleAnim} className="h-4 bg-red-500 rounded" />
      </div>
      <div className="flex flex-col items-center">
        <span>Lung</span>
        <animated.div style={lungAnim} className="h-4 bg-blue-500 rounded" />
      </div>
      <div className="flex flex-col items-center">
        <span>Wealth</span>
        <animated.div style={wealthAnim} className="h-4 bg-yellow-500 rounded" />
      </div>
      <div className="flex flex-col items-center">
        <span>Day {day}</span>
      </div>
    </div>
  );
};

export default Projections;
