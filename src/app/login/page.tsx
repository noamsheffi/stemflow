import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, safeReturnPath, validAccessSession } from "../../lib/access-session";
import styles from "./login.module.css";

export const metadata: Metadata = { title: "Syllo | כניסה", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  if (validAccessSession((await cookies()).get(ACCESS_COOKIE)?.value)) redirect(next);
  const message = params.error === "invalid" ? "הקוד שהוזן אינו נכון. נסו שוב." : params.error === "unavailable" ? "הכניסה אינה זמינה כרגע. נסו שוב בהמשך." : null;
  return <main className={styles.page}>
    <Link className={styles.back} href="/">חזרה לאתר Syllo <span aria-hidden="true">↗</span></Link>
    <section className={styles.card} aria-labelledby="login-title">
      <Image className={styles.logo} src="/brand/syllo-logo.png" alt="Syllo" width={1584} height={672} priority />
      <p className={styles.eyebrow}>מהשיעור הזה לשיעור הבא</p>
      <h1 id="login-title">טוב שחזרת.</h1>
      <p className={styles.description}>הזינו את קוד הגישה כדי להיכנס לסביבת הלמידה.</p>
      <form action="/api/auth/login" method="post" className={styles.form}>
        <input type="hidden" name="next" value={next} />
        <label htmlFor="access-code">קוד גישה</label>
        <input id="access-code" name="code" type="password" required maxLength={128} autoComplete="current-password" autoCapitalize="none" spellCheck={false} dir="ltr" aria-invalid={params.error === "invalid" ? true : undefined} aria-describedby={message ? "login-error" : undefined} autoFocus />
        {message && <p id="login-error" role="alert" className={styles.error}>{message}</p>}
        <button type="submit">כניסה לפלטפורמה <span aria-hidden="true">←</span></button>
      </form>
      <p className={styles.note}>הגישה בשלב זה היא באמצעות קוד משותף.</p>
    </section>
  </main>;
}
