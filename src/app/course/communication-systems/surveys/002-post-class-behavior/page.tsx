import PostClassSurvey from "../../../../../components/post-class-survey";
import styles from "../../../../../components/post-class.module.css";

export const metadata = { title: "אחרי השיעור · שאלון 02 | Syllo" };

export default function Page() {
  return (
    <main className={styles.standalone}>
      <header className={styles.brand}>
        <img src="/brand/syllo-logo.png" alt="Syllo" width="132" height="56" />
      </header>
      <PostClassSurvey />
    </main>
  );
}
