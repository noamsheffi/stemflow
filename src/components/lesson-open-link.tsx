"use client";

import { trackEvent } from "../lib/analytics";
import { course, workspace } from "../lib/course-data";

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
      onClick={() => trackEvent("lesson_open", { workspace_id: workspace.workspaceId, course_id: course.courseId, lesson_id: lessonId, resource_id: resourceId })}
    >
      {children}
    </a>
  );
}
