"use client";

import { trackEvent } from "../lib/analytics";
import { type ResourceKind, course, workspace } from "../lib/course-data";

type LessonOpenLinkProps = {
  href: string;
  lessonId: string;
  resourceId: string;
  resourceKind?: ResourceKind;
  className?: string;
  children: React.ReactNode;
};

export default function LessonOpenLink({ href, lessonId, resourceId, resourceKind = "lesson-html", className, children }: LessonOpenLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => {
        const context = { workspace_id: workspace.workspaceId, course_id: course.courseId, lesson_id: lessonId, resource_id: resourceId };
        if (resourceKind === "lesson-html") {
          trackEvent("lesson_open", context);
        } else {
          trackEvent("resource_open", { workspace_id: context.workspace_id, course_id: context.course_id, resource_id: context.resource_id });
          if (resourceKind === "simulation") trackEvent("simulation_start", context);
        }
      }}
    >
      {children}
    </a>
  );
}
