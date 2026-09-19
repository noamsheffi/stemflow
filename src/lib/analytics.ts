export type CourseEventName =
  | "course_open"
  | "lesson_open"
  | "formula_open"
  | "concept_open"
  | "simulation_start"
  | "resource_open";

export type AnalyticsContext = {
  workspace_id?: string;
  course_id?: string;
  lesson_id?: string;
  slide_id?: string;
  concept_id?: string;
  formula_id?: string;
  resource_id?: string;
};

export type CourseEventProperties = AnalyticsContext;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const gaId = process.env.NEXT_PUBLIC_GA_ID;

function sendToGoogleAnalytics(command: "event", eventName: string, properties: Record<string, string>) {
  if (typeof window === "undefined" || !gaId) return;
  if (window.gtag) {
    window.gtag(command, eventName, properties);
    return;
  }
  window.dataLayer ??= [];
  window.dataLayer.push([command, eventName, properties]);
}

// Application code only uses this provider-independent function. The Google adapter is
// intentionally limited to stable, non-identifying registry IDs.
export function trackEvent(eventName: CourseEventName, properties: CourseEventProperties) {
  const filteredProperties = Object.fromEntries(Object.entries(properties).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  sendToGoogleAnalytics("event", eventName, filteredProperties);
}

export function trackPageView(pathname: string) {
  sendToGoogleAnalytics("event", "page_view", { page_path: pathname });
}
