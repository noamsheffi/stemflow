import styles from "./logout-button.module.css";

export default function LogoutButton() {
  return <form action="/api/auth/logout" method="post" className={styles.form}><button type="submit" className={styles.button}>יציאה</button></form>;
}
