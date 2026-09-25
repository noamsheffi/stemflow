"use client";

import { FormEvent, useState } from "react";
import styles from "./lecturer-interest-modal.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export default function LecturerInterestModal({ triggerClassName = "" }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  function close() {
    if (status !== "submitting") setOpen(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/lecturer-interest", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error("request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return <>
    <button type="button" className={`${styles.trigger} ${triggerClassName}`} onClick={() => { setStatus("idle"); setOpen(true); }}>כניסת מרצים</button>
    {open && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="lecturer-interest-title" dir="rtl">
        <button type="button" className={styles.close} onClick={close} aria-label="סגירת החלון">×</button>
        {status === "success" ? <div className={styles.success}>
          <span className={styles.check} aria-hidden="true">✓</span>
          <h2 id="lecturer-interest-title">תודה, קיבלנו את הפרטים.</h2>
          <p>ניצור איתך קשר כשנפתח את סביבת המרצים.</p>
          <button type="button" className={styles.submit} onClick={close}>סגירה</button>
        </div> : <>
          <p className={styles.eyebrow}>Syllo למרצים</p>
          <h2 id="lecturer-interest-title">רוצים להצטרף?</h2>
          <p className={styles.description}>השאירו פרטים ונעדכן אתכם כשהכלים למרצים יהיו מוכנים.</p>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.twoColumns}>
              <label>שם פרטי<input name="firstName" required maxLength={80} autoComplete="given-name" /></label>
              <label>שם משפחה<input name="lastName" required maxLength={80} autoComplete="family-name" /></label>
            </div>
            <label>מייל<input name="email" type="email" required maxLength={254} autoComplete="email" dir="ltr" /></label>
            <label>מספר טלפון<input name="phone" type="tel" required maxLength={40} autoComplete="tel" dir="ltr" /></label>
            <label>מכללה / אוניברסיטה<input name="institution" required maxLength={160} /></label>
            <label>קורס<input name="course" required maxLength={160} /></label>
            {status === "error" && <p className={styles.error} role="alert">לא הצלחנו לשמור את הפרטים. נסו שוב.</p>}
            <button className={styles.submit} type="submit" disabled={status === "submitting"}>{status === "submitting" ? "שולחים…" : "השאירו פרטים"}</button>
          </form>
        </>}
      </section>
    </div>}
  </>;
}
