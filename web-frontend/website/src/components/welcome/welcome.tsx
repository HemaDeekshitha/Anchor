import styles from "./welcome.module.css"; // Import the styles object

export default function Welcome() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to My Website!</h1>
      <p>This component is styled using CSS Modules.</p>
    </div>
  );
}
