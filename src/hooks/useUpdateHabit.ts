import { useEventLogger } from './useEventLogger';

export const useUpdateHabit = (userId: string) => {
  const { logEvent } = useEventLogger(userId);

  const updateHabit = async (habitId: string, data: any) => {
    const res = await fetch(import.meta.env.VITE_UPDATE_HABIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, ...data }),
    });

    const json = await res.json();
    logEvent({ type: 'habit_updated', data: { habitId, ...data } });
    return json;
  };

  return { updateHabit };
};
