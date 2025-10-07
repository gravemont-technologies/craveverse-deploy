// src/components/Projections.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type ProjectionsProps = { userId: string };

const computeSimpleProjection = (streak: number, craving = "Sugar") => {
  const musclePct = Math.min(1, streak / 120);
  const lungPct = Math.min(1, streak / 90);
  const wealth = streak * 500;
  const soulmate = Math.min(1, streak / 60);
  return { musclePct, lungPct, wealth, soulmate };
};

const Projections: React.FC<ProjectionsProps> = ({ userId }) => {
  const [projection, setProjection] = useState<any | null>(null);
  const [streak, setStreak] = useState<number>(parseInt(localStorage.getItem("streak") || "0"));

  useEffect(() => {
    const fetchProjection = async () => {
      const { data } = await supabase.from("projections").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).single();
      if (data) {
        setProjection(data);
      } else {
        // compute and insert
        const computed = computeSimpleProjection(streak);
        const { data: inserted } = await supabase.from("projections").insert({
          user_id: userId,
          day: 0,
          muscle_pct: computed.musclePct,
          lung_pct: computed.lungPct,
          wealth: computed.wealth,
          soulmate_level: computed.soulmate,
          computed_at: new Date().toISOString()
        }).select().single();
        setProjection(inserted);
      }
    };
    fetchProjection();
  }, [userId, streak]);

  if (!projection) return <div>Loading projections...</div>;

  return (
    <div className="p-4 border rounded">
      <div className="font-bold text-lg">Projections</div>
      <div className="mt-2 grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Muscle</div>
          <div className="text-xl font-semibold">{(projection.muscle_pct * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Lungs</div>
          <div className="text-xl font-semibold">{(projection.lung_pct * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Wealth</div>
          <div className="text-xl font-semibold">${projection.wealth.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
};

export default Projections;
