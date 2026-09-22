"use client";

import { useRef, useState } from "react";
import styles from "./lecture-extension.module.css";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function LectureExtension() {
  const [position, setPosition] = useState({ x: 28, y: 180 });
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPosition({
      x: clamp(event.clientX - dragOffset.current.x, 12, window.innerWidth - 88),
      y: clamp(event.clientY - dragOffset.current.y, 12, window.innerHeight - 190),
    });
  }

  function endDrag() {
    setDragging(false);
  }

  return (
    <div
      className={`${styles.widget} ${expanded ? styles.expanded : ""} ${dragging ? styles.dragging : ""}`}
      style={{ left: position.x, top: position.y }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="region"
      aria-label="Lecture control"
    >
      {expanded && (
        <div className={styles.panel}>
          <span className={styles.liveDot} />
          <span>Lecture notes</span>
          <span className={styles.timer}>12:48</span>
        </div>
      )}
      <button className={styles.brand} onClick={() => setExpanded((value) => !value)} aria-label="Toggle lecture panel">
        <span className={styles.notionMark} aria-hidden="true">N</span>
      </button>
      <span className={styles.grip} aria-hidden="true"><i /><i /><i /></span>
      <div className={styles.actions}>
        <button className={`${styles.action} ${paused ? styles.active : ""}`} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume lecture" : "Pause lecture"}>
          <span className={paused ? styles.playIcon : styles.pauseIcon} aria-hidden="true" />
        </button>
        <button className={`${styles.action} ${stopped ? styles.activeStop : ""}`} onClick={() => setStopped((value) => !value)} aria-label={stopped ? "Restart lecture" : "Stop lecture"}>
          <span className={styles.stopIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
