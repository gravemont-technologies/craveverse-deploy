import { supabase } from '../lib/supabaseClient';

export const updateHabit = async ({
  user_id,
  habit_type,
  coins_delta,
  streak_delta,
  toughness,
  event
}: {
  user_id: string;
  habit_type: string;
  coins_delta: number;
  streak_delta: number;
  toughness: string;
  event: { type: string; data: any };
}) => {
  const res = await fetch('/supabase/functions/updateHabit', {
    method: 'POST',
    body: JSON.stringify({ user_id, habit_type, coins_delta, streak_delta, toughness, event }),
  });

  return res.json();
};
