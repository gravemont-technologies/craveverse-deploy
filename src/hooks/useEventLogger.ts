// src/hooks/useEventLogger.ts
import { useRef } from "react";
import posthog from "../lib/posthogClient";
import { supabase } from "../lib/supabaseClient";

type Event = { type: string; data: any };

export const useEventLogger = (userId: string) => {
  const queue = useRef<Event[]>([]);
  const timer = useRef<number | null>(null);

  const flushEvents = async () => {
    if (!queue.current.length) return;
    const eventsToSend = [...queue.current];
    queue.current = [];

    try {
      // PostHog capture
      eventsToSend.forEach((e) => {
        try {
          posthog?.capture?.(e.type, { ...e.data, user_id: userId });
        } catch (err) {
          console.warn("PostHog capture error", err);
        }
      });

      // Batch insert into Supabase events table
      await supabase.from("events").insert(
        eventsToSend.map((e) => ({
          user_id: userId,
          event_type: e.type,
          event_data: e.data,
          created_at: new Date().toISOString()
        }))
      );
    } catch (err) {
      console.error("flushEvents error", err);
    } finally {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    }
  };

  const scheduleFlush = (delay = 2000) => {
    if (timer.current) return;
    timer.current = window.setTimeout(() => {
      flushEvents();
    }, delay);
  };

  const logEvent = (event: Event) => {
    queue.current.push(event);
    if (queue.current.length >= 5) {
      flushEvents();
    } else {
      scheduleFlush();
    }
  };

  return { logEvent, flushEvents };
};
