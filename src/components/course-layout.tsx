import type { ReactNode } from "react";
import StudentWorkspace from "./student-workspace";

export default function CourseLayout({ children }: { children: ReactNode }) {
  return <StudentWorkspace>{children}</StudentWorkspace>;
}
