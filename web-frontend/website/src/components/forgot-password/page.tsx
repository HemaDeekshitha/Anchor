"use client";

import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

// ✅ import image from same folder
import anchorLogo from "../../../public/assets/logo.png";

export default function ForgotPasswordPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Anchor brand */}
        <div className={styles.brand}>
          <Image
            src={anchorLogo}
            alt="Anchor logo"
            width={42}
            height={42}
            priority
          />
          <h1>Anchor</h1>
        </div>

        <h2 className={styles.title}>Forgot your password?</h2>

        <p className={styles.subtitle}>
          Enter your email and we’ll send you a reset link.
        </p>

        <input type="email" placeholder="Your email" className={styles.input} />

        <button className={styles.primary}>Send reset link</button>

        <Link href="/login" className={styles.back}>
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
