// src/lib/posthogClient.ts
import posthog from "posthog-js";

const key = process.env.POSTHOG_KEY;
const host = process.env.POSTHOG_HOST || "https://app.posthog.com";

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

