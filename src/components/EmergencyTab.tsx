import React, { useState } from 'react';
import { useEventLogger } from '../hooks/useEventLogger';

type EmergencyTabProps = { userId: string };

const EmergencyTab: React.FC<EmergencyTabProps> = ({ userId }) => {
  const [severity, setSeverity] = useState(1);
  const { logEvent } = useEventLogger(userId);

  const handleEmergency = async () => {
    // Log event
    logEvent({ type: 'emergency', data: { severity } });

    // Ritual guidance (simplified)
    alert(`Ritual started for severity ${severity}:\n- 30s breathing\n- Goal recall\n- Recommit`);

    // Shareable message
    if (navigator.share) {
      navigator.share({
        title: 'CraveVerse Emergency',
        text: `Committed ${severity} severity emergency. Help me stay strong!`
      });
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 items-center">
      <label className="text-lg font-semibold">Emergency Severity: {severity}</label>
      <input
        type="range"
        min={1}
        max={10}
        value={severity}
        onChange={(e) => setSeverity(Number(e.target.value))}
        className="w-64"
      />
      <button
        onClick={handleEmergency}
        className="bg-red-500 text-white font-bold py-2 px-6 rounded-full animate-pulse"
      >
        Emergency!
      </button>
    </div>
  );
};

export default EmergencyTab;
