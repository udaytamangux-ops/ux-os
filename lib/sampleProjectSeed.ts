export const SAMPLE_PROJECT_SEED_KEY = "ux-os-sample-project-seeded";

export function markSampleProjectSeeded() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAMPLE_PROJECT_SEED_KEY, "true");
}

export function hasSampleProjectSeeded() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SAMPLE_PROJECT_SEED_KEY) === "true";
}
