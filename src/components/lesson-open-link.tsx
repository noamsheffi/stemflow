"use client";

import { trackEvent } from "../lib/analytics";

type LessonOpenLinkProps = {
  href: string;
  lessonId: string;
  resourceId: string;
  className?: string;
  children: React.ReactNode;
};

export default function LessonOpenLink({ href, lessonId, resourceId, className, children }: LessonOpenLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => trackEvent("lesson_open", { courseId: "communication-systems", lessonId, resourceId })}
    >
      {children}
    </a>
  );
}
