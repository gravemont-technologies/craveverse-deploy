import { useRef } from 'react';
import posthog from '../lib/posthogClient';
import { supabase } from '../lib/supabaseClient';

type Event = { type: string; data: any };

export const useEventLogger = (userId: string) => {
  const queue = useRef<Event[]>([]);

  const logEvent = (event: Event) => {
    // Add to batch queue
    queue.current.push(event);

    // Send batch every 2 seconds or if queue > 5
    if (queue.current.length >= 5) flushEvents();
    else setTimeout(flushEvents, 2000);
  };

  const flushEvents = async () => {
    if (!queue.current.length) return;
    const eventsToSend = [...queue.current];
    queue.current = [];

    // Send to PostHog
    eventsToSend.forEach((e) => posthog.capture(e.type, { ...e.data, user_id: userId }));

    // Send to Supabase
    await supabase.from('events').insert(
      eventsToSend.map((e) => ({
        user_id: userId,
        event_type: e.type,
        event_data: e.data
      }))
    );
  };

  return { logEvent };
};
