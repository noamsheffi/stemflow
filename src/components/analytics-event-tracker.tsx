"use client";

import { useEffect, useRef } from "react";
import { type CourseEventName, type CourseEventProperties, trackEvent } from "../lib/analytics";

export default function AnalyticsEventTracker({ eventName, properties }: { eventName: CourseEventName; properties: CourseEventProperties }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent(eventName, properties);
  }, [eventName, properties]);

  return null;
}
