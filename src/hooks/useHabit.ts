// src/hooks/useHabit.ts
// kept for compatibility with older imports; delegates to update habit edge function
import { useUpdateHabit } from "./useUpdateHabit";

export const useHabit = (userId: string) => {
  return useUpdateHabit(userId);
};
