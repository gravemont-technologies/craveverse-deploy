// src/components/CompetitionTab.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useEventLogger } from "../hooks/useEventLogger";

type CompetitionTabProps = { userId: string };

const CompetitionTab: React.FC<CompetitionTabProps> = ({ userId }) => {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const { logEvent } = useEventLogger(userId);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const { data } = await supabase.from("competitions").select("*").order("created_at", { ascending: false });
      if (data) setCompetitions(data);
    };
    fetchCompetitions();

    const subscription = supabase.from("competitions").on("*", payload => {
      // Refresh on changes
      fetchCompetitions();
    }).subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const joinCompetition = async (competitionId: string) => {
    try {
      // if file present, upload first
      let uploadUrl = null;
      if (file) {
        const filePath = `competition_proofs/${competitionId}/${userId}_${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        const { publicURL } = supabase.storage.from("uploads").getPublicUrl(filePath);
        uploadUrl = publicURL;
      }

      const { error } = await supabase.from("competition_members").insert({
        competition_id: competitionId,
        user_id: userId,
        photo_url: uploadUrl
      });

      if (error) throw error;
      logEvent({ type: "join_competition", data: { competitionId } });
      alert("Joined competition!");
    } catch (err) {
      console.error("joinCompetition error", err);
      alert("Failed to join competition");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex gap-2">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <span className="text-sm text-muted-foreground self-center">Optional photo proof</span>
      </div>

      {competitions.map((comp) => (
        <div key={comp.id} className="p-4 border rounded-md flex justify-between items-center">
          <div>
            <div className="font-semibold">{comp.name}</div>
            <div className="text-sm text-muted-foreground">{comp.goal}</div>
          </div>
          <button onClick={() => joinCompetition(comp.id)} className="bg-blue-500 text-white rounded px-4 py-1">
            Join
          </button>
        </div>
      ))}
    </div>
  );
};

export default CompetitionTab;

