"use client";

import { trackEvent } from "../lib/analytics";
import { course, supportingMaterials, workspace } from "../lib/course-data";
import styles from "./student-workspace.module.css";

const groups = [
  { kind: "book", title: "ספרות" },
  { kind: "syllabus", title: "מסמכי הקורס" },
  { kind: "formula-sheet", title: "נוסחאות" },
] as const;

const materialType = (kind: (typeof supportingMaterials)[number]["kind"]) => kind === "book" ? "ספר" : kind === "syllabus" ? "סילבוס" : "PDF";

export default function SupportingMaterials() {
  return <div className={styles.sectionGrid}>
    {groups.map((group) => {
      const items = supportingMaterials.filter((material) => material.kind === group.kind);
      if (items.length === 0) return null;
      return <section className={`${styles.card} ${styles.sectionGroup}`} key={group.kind}>
        <h2 className={styles.groupHeading}>{group.title}<span dir="ltr">{items.length}</span></h2>
        <div className={styles.materialList}>
          {items.map((material) => <article className={`${styles.card} ${styles.materialItem}`} key={material.materialId}>
            <span className={styles.materialType} dir="ltr">{materialType(material.kind)}</span>
            <div className={styles.materialText}><h3>{material.title}</h3><p>{material.description}</p></div>
            <a className={styles.materialLink} href={material.href} target="_blank" rel="noreferrer" onClick={() => trackEvent("supporting_material_open", { workspace_id: workspace.workspaceId, course_id: course.courseId, resource_id: material.materialId, material_id: material.materialId })}>פתיחת הקובץ ↗</a>
          </article>)}
        </div>
      </section>;
    })}
  </div>;
}
