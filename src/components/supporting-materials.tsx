"use client";

import { trackEvent } from "../lib/analytics";
import { course, supportingMaterials, workspace } from "../lib/course-data";

export default function SupportingMaterials() {
  return (
    <section className="supporting-material-list" aria-label="חומרי עזר">
      {supportingMaterials.map((material) => (
        <article className="supporting-material-card" key={material.materialId}>
          <div className="supporting-material-icon" aria-hidden="true">{material.kind === "book" ? "▤" : material.kind === "syllabus" ? "☷" : "ƒ"}</div>
          <div className="supporting-material-body">
            <p className="item-kicker">חומר עזר</p>
            <h2>{material.title}</h2>
            <p>{material.description}</p>
          </div>
          <a className="lesson-card-action primary supporting-material-action" href={material.href} target="_blank" rel="noreferrer" onClick={() => trackEvent("supporting_material_open", { workspace_id: workspace.workspaceId, course_id: course.courseId, resource_id: material.materialId, material_id: material.materialId })}>
            פתיחת PDF
          </a>
        </article>
      ))}
    </section>
  );
}
