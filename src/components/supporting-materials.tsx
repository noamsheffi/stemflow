"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trackEvent } from "../lib/analytics";
import { course, supportingMaterials, workspace } from "../lib/course-data";
import styles from "./supporting-materials.module.css";

type MaterialGroup = "practice" | "documents" | "books";
type Material = {
  id: string;
  title: string;
  description: string;
  href: string;
  group: MaterialGroup;
  format: string;
  external?: boolean;
};

const practice: Material = {
  id: "midterm-practice",
  title: "הכנה לבוחן אמצע",
  description: "7 שאלות עם רמזים ופתרונות שלב־אחר־שלב, כולל משוב אישי.",
  href: "/course/communication-systems/midterm",
  group: "practice",
  format: "תרגול אינטראקטיבי",
};

const materials: Material[] = [
  practice,
  ...supportingMaterials.map((material): Material => ({
    id: material.materialId,
    title: material.title,
    description: material.description,
    href: material.href,
    group: material.kind === "book" ? "books" : "documents",
    format: material.kind === "book" ? "ספר" : "PDF",
    external: true,
  })),
];

const groups: { id: MaterialGroup; title: string }[] = [
  { id: "practice", title: "תרגול והכנה לבוחן" },
  { id: "documents", title: "מסמכי הקורס" },
  { id: "books", title: "ספרות" },
];

function trackOpen(material: Material) {
  trackEvent("supporting_material_open", {
    workspace_id: workspace.workspaceId,
    course_id: course.courseId,
    resource_id: material.id,
    material_id: material.id,
  });
}

export default function SupportingMaterials() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<MaterialGroup | "all">("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("he");
  const filteredMaterials = useMemo(() => materials.filter((material) => {
    const matchesGroup = activeGroup === "all" || material.group === activeGroup;
    const matchesQuery = !normalizedQuery || `${material.title} ${material.description} ${material.format}`.toLocaleLowerCase("he").includes(normalizedQuery);
    return matchesGroup && matchesQuery;
  }), [activeGroup, normalizedQuery]);
  const visiblePractice = filteredMaterials.some((material) => material.id === practice.id);
  const listMaterials = filteredMaterials.filter((material) => material.id !== practice.id);

  return <div className={styles.page}>
    {visiblePractice && <section className={styles.featured} aria-labelledby="midterm-practice-title">
      <div className={styles.featuredIcon} aria-hidden="true">✦</div>
      <div className={styles.featuredBody}>
        <div className={styles.featuredLabel}><span>מומלץ</span><span className={styles.newBadge}>חדש</span></div>
        <h2 id="midterm-practice-title">{practice.title}</h2>
        <p>{practice.description}</p>
      </div>
      <Link className={styles.featuredAction} href={practice.href} onClick={() => trackOpen(practice)}>
        מתחילים לתרגל <span aria-hidden="true">←</span>
      </Link>
    </section>}

    <div className={styles.toolbar}>
      <label className={styles.search}>
        <span aria-hidden="true">⌕</span>
        <span className={styles.visuallyHidden}>חיפוש בחומרי העזר</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש בחומרי העזר" type="search" />
      </label>
      <div className={styles.filters} role="group" aria-label="סינון לפי סוג חומר">
        <button type="button" aria-pressed={activeGroup === "all"} onClick={() => setActiveGroup("all")}>הכול <b>{materials.length}</b></button>
        <button type="button" aria-pressed={activeGroup === "practice"} onClick={() => setActiveGroup("practice")}>תרגול <b>1</b></button>
        <button type="button" aria-pressed={activeGroup === "documents"} onClick={() => setActiveGroup("documents")}>מסמכי קורס <b>{materials.filter((item) => item.group === "documents").length}</b></button>
        <button type="button" aria-pressed={activeGroup === "books"} onClick={() => setActiveGroup("books")}>ספרות <b>{materials.filter((item) => item.group === "books").length}</b></button>
      </div>
      <p className={styles.resultCount} aria-live="polite">מוצגים {filteredMaterials.length} מתוך {materials.length} פריטים</p>
    </div>

    <div className={styles.groups}>
      {groups.map((group) => {
        const items = listMaterials.filter((material) => material.group === group.id);
        if (items.length === 0) return null;
        return <section className={styles.group} key={group.id}>
          <h2 className={styles.groupHeading}>{group.title}<span>{items.length}</span></h2>
          <div className={styles.rows}>
            {items.map((material) => <article className={styles.row} key={material.id}>
              <span className={styles.fileIcon} aria-hidden="true">{material.format === "ספר" ? "▤" : "PDF"}</span>
              <div className={styles.rowText}><h3>{material.title}</h3><p>{material.description}</p></div>
              <span className={styles.format}>{material.format}</span>
              {material.external ? <a className={styles.openLink} href={material.href} target="_blank" rel="noreferrer" onClick={() => trackOpen(material)}>פתיחת הקובץ <span aria-hidden="true">↗</span></a> : <Link className={styles.openLink} href={material.href} onClick={() => trackOpen(material)}>פתיחת התרגול <span aria-hidden="true">←</span></Link>}
            </article>)}
          </div>
        </section>;
      })}
    </div>
    {filteredMaterials.length === 0 && <div className={styles.empty}>לא נמצאו חומרים מתאימים. אפשר לשנות את מילות החיפוש או לבחור סוג חומר אחר.</div>}
  </div>;
}
