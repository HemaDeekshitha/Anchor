"use client";

import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";


// ✅ Import all images
import anchorLogo from "./images/favicon.ico";
import googleIcon from "./images/google.png";
import linkedinIcon from "./images/linkedin.png";
import githubIcon from "./images/github.png";

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      {/* LEFT PANEL */}
<div className={styles.left}>
  <div className={`${styles.brand} ${styles.brandAnim}`}>
    <Image
      src={anchorLogo}
      alt="Anchor logo"
      width={48}
      height={48}
      priority
    />
    <h1>Anchor</h1>
  </div>

  <h2 className={styles.headingAnim}>Welcome back</h2>
  <h4 className={styles.subHeadingAnim}>
    Stay motivated. Stay consistent. Grow with purpose.
  </h4>
</div>


      {/* RIGHT PANEL */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h3>Login to your account</h3>
          <p className={styles.subtitle}>It’s nice to see you again</p>

          <input
            type="email"
            placeholder="Your email"
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Your password"
            className={styles.input}
          />

          <div className={styles.row}>
            <label className={styles.checkbox}>
              <input type="checkbox" />
              Remember me
            </label>

            <Link href="/forgot-password" className={styles.link}>
              Forgot password?
            </Link>
          </div>

          <button className={styles.primary}>Log in</button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          {/* SOCIAL LOGIN */}
          <button className={styles.socialGoogle}>
            <Image src={googleIcon} alt="Google" width={20} height={20} />
            Continue with Google
          </button>

          <div className={styles.socialRow}>
            <button className={styles.socialSmall}>
              <Image src={linkedinIcon} alt="LinkedIn" width={22} height={22} />
              Continue with LinkedIn
            </button>

            <button className={styles.socialSmall}>
              <Image src={githubIcon} alt="GitHub" width={22} height={22} />
              Continue with GitHub
            </button>
          </div>

          <p className={styles.signup}>
  Don’t have an account?{" "}
  <Link href="/signup">Sign up</Link>
</p>

        </div>
      </div>
    </div>
  );
}
