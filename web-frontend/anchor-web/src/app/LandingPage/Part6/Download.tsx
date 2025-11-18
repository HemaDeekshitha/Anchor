"use client";

import styles from "./Download.module.css";
import Image from "next/image";
import ScrollInViewMotion from "@/app/Components/Scroll/ScrollInViewMotion";

export default function Download() {
  return (
    <section className={styles.section}>
      <ScrollInViewMotion direction="up">
        <h2 className={styles.heading}>Download Fintro</h2>
        <p className={styles.subheading}>
          Experience a financial app that adapts to your lifestyle and preferences
        </p>
      </ScrollInViewMotion>

      <div className={styles.ctaBox}>
        <Image
          src="/assets/qr-code.png"
          alt="QR Code"
          width={60}
          height={60}
          className={styles.qr}
        />
        <span className={styles.ctaText}>Get The IOS App</span>
      </div>

      <div className={styles.screenshots}>
        <Image
          src="/assets/ios-screen-1.png"
          alt="iOS Screen 1"
          width={240}
          height={500}
          className={styles.deviceImage}
        />
        <Image
          src="/assets/ios-screen-2.png"
          alt="iOS Screen 2"
          width={240}
          height={500}
          className={styles.deviceImage}
        />
      </div>
    </section>
  );
}
