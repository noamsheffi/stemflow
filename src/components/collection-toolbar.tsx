"use client";

import styles from "./collection-toolbar.module.css";

type CollectionView<T extends string> = { value: T; label: string };

type CollectionToolbarProps<T extends string> = {
  ariaLabel: string;
  selectedView: T;
  views: CollectionView<T>[];
  onViewChange: (view: T) => void;
  summary: string;
  onReset: () => void;
  resetLabel: string;
};

export default function CollectionToolbar<T extends string>({
  ariaLabel,
  selectedView,
  views,
  onViewChange,
  summary,
  onReset,
  resetLabel,
}: CollectionToolbarProps<T>) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.viewToggle} role="group" aria-label={ariaLabel}>
        {views.map((view) => (
          <button key={view.value} type="button" aria-pressed={selectedView === view.value} onClick={() => onViewChange(view.value)}>
            {view.label}
          </button>
        ))}
      </div>
      <span role="status" aria-live="polite">{summary}</span>
      <button type="button" className={styles.reset} onClick={onReset}>{resetLabel}</button>
    </div>
  );
}
