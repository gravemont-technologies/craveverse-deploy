import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useEventLogger } from '../hooks/useEventLogger';

type CompetitionTabProps = { userId: string };

const CompetitionTab: React.FC<CompetitionTabProps> = ({ userId }) => {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const { logEvent } = useEventLogger(userId);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const { data } = await supabase.from('competitions').select('*');
      if (data) setCompetitions(data);
    };
    fetchCompetitions();
  }, []);

  const joinCompetition = async (competitionId: string) => {
    await supabase.from('competition_members').insert({ user_id: userId, competition_id: competitionId });
    logEvent({ type: 'join_competition', data: { competitionId } });
    alert('Joined competition!');
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {competitions.map((comp) => (
        <div key={comp.id} className="p-4 border rounded-md flex justify-between items-center">
          <span>{comp.name}</span>
          <button
            onClick={() => joinCompetition(comp.id)}
            className="bg-blue-500 text-white rounded px-4 py-1"
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
};

export default CompetitionTab;

