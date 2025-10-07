// src/components/EmergencyTab.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useEventLogger } from "../hooks/useEventLogger";

type EmergencyTabProps = { userId: string };

const EmergencyTab: React.FC<EmergencyTabProps> = ({ userId }) => {
  const [severity, setSeverity] = useState(1);
  const { logEvent } = useEventLogger(userId);

  const handleEmergency = async () => {
    try {
      // Log to supabase emergency_events
      const ritual_steps = [
        { step: "breathing", duration_s: 30, completed: true, at: new Date().toISOString() }
      ];
      await supabase.from("emergency_events").insert({
        user_id: userId,
        severity,
        ritual_steps,
        shared: !!navigator.share,
        metadata: { via: "frontend" }
      });

      logEvent({ type: "emergency_triggered", data: { severity } });

      // Ritual guidance (frontend)
      alert(`Ritual started for severity ${severity}:\n- 30s breathing\n- Goal recall\n- Recommit`);

      if (navigator.share) {
        navigator.share({
          title: "CraveVerse Emergency",
          text: `I need support: severity ${severity} emergency. Help me stay strong!`
        }).catch(() => {});
      }
    } catch (err) {
      console.error("handleEmergency error", err);
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
      <button onClick={handleEmergency} className="bg-red-500 text-white font-bold py-2 px-6 rounded-full animate-pulse">
        Emergency!
      </button>
    </div>
  );
};

export default EmergencyTab;
