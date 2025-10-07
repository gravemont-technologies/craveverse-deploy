// src/lib/posthogClient.ts
import posthog from "posthog-js";

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

if (key) {
  posthog.init(key, {
    api_host: host,
    autocapture: true,
    disable_session_recording: true
  });
} else {
  // eslint-disable-next-line no-console
  console.warn("PostHog key missing, analytics disabled");
}

export default posthog;

