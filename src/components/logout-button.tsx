import styles from "./logout-button.module.css";

export default function LogoutButton({ variant, compact = false }: { variant?: "sidebar"; compact?: boolean }) {
  const formClassName = variant === "sidebar" ? `${styles.form} ${styles.sidebarForm}${compact ? ` ${styles.compactForm}` : ""}` : styles.form;
  const buttonClassName = variant === "sidebar" ? `${styles.button} ${styles.sidebarButton}${compact ? ` ${styles.compactButton}` : ""}` : styles.button;

  return <form action="/api/auth/logout" method="post" className={formClassName}><button type="submit" className={buttonClassName} aria-label="יציאה">{compact ? <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H13" /><path d="M11 12h9M16.5 7.5 21 12l-4.5 4.5" /></svg> : "יציאה"}</button></form>;
}
