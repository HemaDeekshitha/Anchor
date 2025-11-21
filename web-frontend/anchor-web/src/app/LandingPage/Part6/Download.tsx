"use client";

import styles from "./Download.module.css";
import { useEffect, useState } from "react";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";


export default function Download() {
  const [animationData, setAnimationData] = useState(null);
const router = useRouter();
  useEffect(() => {
    fetch("/assets/lottie/2.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);
  const ContactPageHandler = () => {
    router.replace("/ContactPage");
  };

  return (
    <section id="download" className={styles.section}>
      
      {/* Lottie background animation */}
      {animationData && (
        <div className={styles.lottieBackground}>
          <Lottie animationData={animationData} loop={true} />
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Pill Tag */}
        <ScrollReveal animation="up">
          
  
          <div className={styles.tagContainer}>
            <span className={styles.dot}></span>
            <span>Available on Web & iOS</span>
          </div>
          
        </ScrollReveal>

        {/* Main Heading */}
        <ScrollReveal animation="up">
          <h2 className={styles.heading}>
            Curious what true career clarity feels like? Let's finally anchor your path to success.
          </h2>
        </ScrollReveal>

        {/* Subtext */}
        {/* <ScrollReveal animation="up">
          <p className={styles.subheading}>
            Curious what true career clarity feels like? Let's finally anchor your path to success.
          </p>
        </ScrollReveal> */}

        {/* Main CTA Button */}
        <ScrollReveal animation="up">
          <button className={styles.ctaButton} onClick={ContactPageHandler}>
            {/* Keeping your QR code logic, but smaller as an icon */}
            {/* <Image
              src="/assets/qr-code.png"
              alt="QR"
              width={24}
              height={24}
              className={styles.qrIcon}
            /> */}
            <span>Join the Waitlist</span>
          </button>
        </ScrollReveal>

        {/* Social Icons / Divider */}
        {/* <div className={styles.socialRow}>
           <span className={styles.socialLink}>Instagram</span>
           <span className={styles.socialLink}>|</span>
           <span className={styles.socialLink}>Twitter</span>
           <span className={styles.socialLink}>|</span>
           <span className={styles.socialLink}>LinkedIn</span>
        </div> */}
      </div>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div>hello@anchor.app</div>
        <div>Designed in React</div>
        <div>All rights reserved, ©2025</div>
      </footer>
    </section>
  );
}