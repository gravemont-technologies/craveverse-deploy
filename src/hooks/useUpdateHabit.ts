// src/hooks/useUpdateHabit.ts
import { useEventLogger } from "./useEventLogger";

export const useUpdateHabit = (userId: string) => {
  const { logEvent } = useEventLogger(userId);

  const updateHabit = async (habitType: string, payload: {
    resisted?: boolean;
    relapsed?: boolean;
    coins_delta?: number;
    streak_delta?: number;
    toughness?: string;
    meta?: any;
  }) => {
    const url = process.env.UPDATE_HABIT_URL!;
    if (!url) throw new Error("UPDATE_HABIT_URL is not set");

    const event = payload.resisted ? { type: "resist", data: {} } : (payload.relapsed ? { type: "relapse", data: {} } : { type: "manual", data: {} });

    const body = {
      user_id: userId,
      habit_type: habitType,
      coins_delta: payload.coins_delta ?? 0,
      streak_delta: payload.streak_delta ?? 0,
      toughness: payload.toughness,
      event,
      meta: payload.meta ?? {}
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || "updateHabit failed");
    }

    // Log to PostHog + Supabase events
    logEvent({ type: "habit_updated", data: { habit_type: habitType, payload } });

    return json;
  };

  return { updateHabit };
};
