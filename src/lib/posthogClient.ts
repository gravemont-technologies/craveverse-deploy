import posthog from 'posthog-js';

const key = import.meta.env.VITE_POSTHOG_KEY!;
const host = import.meta.env.VITE_POSTHOG_HOST!;

posthog.init(key, {
  api_host: host,
  autocapture: true,
  disable_session_recording: true
});

export default posthog;
