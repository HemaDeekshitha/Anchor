import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <div className={styles.header}>
      <a href="#" className={styles.menuH}>
        Anchor
      </a>
      <div className={styles.menu}>
        <p className={styles.menuP}>Benefits</p>
        <p className={styles.menuP}>Get Started</p>
        <p className={styles.menuP}>Features</p>
        <p className={styles.menuP}>Testimonials</p>
        <p className={styles.menuP}>FAQs</p>
      </div>
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        <Image
          src="/assets/appstore.svg"
          alt="Download on the App Store"
          width={140}
          height={50}
        />
      </a>
    </div>
  );
}
