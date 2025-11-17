import Image from "next/image";
import styles from "./Box2.module.css";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

export default function Box2() {
  return (
    <ScrollReveal animation="up">
      <div className={styles.Box2Container}>
        <h4 className={styles.header}>Benefits</h4>
        <h1 className={styles.title}>Make Your Finances Truly Yours</h1>
        <p className={styles.subtitle}>
          experience a financial app that adapts to your lifestyles and
          preferences
        </p>

        <div className={styles.benfitsContainer}>
          <ScrollReveal animation="up">
            <div className={styles.Items}>
              <div className={styles.ItemBox}>
                <h2 className={styles.Itemtitle}>Smart Search</h2>
                <p className={styles.Itemsubtitle}>
                  Fintro learns from your spending habits and financial
                  behavior, offering personalised insights.
                </p>
              </div>
              <Image src="/assets/an.png" alt="" width={250} height={250} />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="up">
            <div className={styles.Items}>
              <div className={styles.ItemBox}>
                <h2 className={styles.Itemtitle}>Smart Search</h2>
                <p className={styles.Itemsubtitle}>
                  Fintro learns from your spending habits and financial
                  behavior, offering personalised insights.
                </p>
              </div>
              <Image src="/assets/an.png" alt="" width={250} height={250} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </ScrollReveal>
  );
}
