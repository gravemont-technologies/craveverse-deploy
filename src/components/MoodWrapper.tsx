import React, { useEffect, useState } from 'react';

type MoodWrapperProps = {
  stress: number;
  streak: number;
  relapse: boolean;
  children: React.ReactNode;
};

const MoodWrapper: React.FC<MoodWrapperProps> = ({ stress, streak, relapse, children }) => {
  const [moodClass, setMoodClass] = useState('calm');

  useEffect(() => {
    if (relapse) setMoodClass('muted');
    else if (streak > 5) setMoodClass('vibrant');
    else if (stress > 7) setMoodClass('calm-slow');
    else setMoodClass('calm');
  }, [stress, streak, relapse]);

  return <div className={`transition-all duration-500 ${moodClass}`}>{children}</div>;
};

export default React.memo(MoodWrapper);
