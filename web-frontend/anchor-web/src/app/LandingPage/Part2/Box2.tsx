import Image from "next/image";
import styles from "./Box2.module.css";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

export default function Box2() {
  return (
    // <ScrollReveal animation="up">
    <div id="benefits" className={styles.Box2Container}>
      <ScrollReveal animation="up">
        <h4 className={styles.header}>Benefits</h4>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <h1 className={styles.title}>Job Search Momentum
</h1>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <p className={styles.subtitle}>
          Anchor brings clarity, structure, and daily momentum to your job search.

        </p>
      </ScrollReveal>

      <div className={styles.benefitsContainer}>
        <ScrollReveal animation="up">
          <div className={styles.Items}>
            <div className={styles.ItemBox}>
              <h2 className={styles.Itemtitle}>Aim High, Stand Out</h2>
              <p className={styles.Itemsubtitle}>
                Target the perfect job and make your application shine.
              </p>
            </div>
            <Image src="/assets/benefits1.png" alt="" width={250} height={250} style = {{borderRadius:"20px"}} />
          </div>
        </ScrollReveal>

        <ScrollReveal animation="up">
          <div className={styles.Items}>
            <div className={styles.ItemBox}>
              <h2 className={styles.Itemtitle}>Win the Offer, Take Off</h2>
              <p className={styles.Itemsubtitle}>
                Secure the reward and launch your career to new heights.
              </p>
            </div>
            <Image src="/assets/b2.png" alt="" width={250} height={250} style = {{borderRadius:"20px"}} />
          </div>
        </ScrollReveal>
      </div>
    </div>
    // </ScrollReveal>
  );
}
