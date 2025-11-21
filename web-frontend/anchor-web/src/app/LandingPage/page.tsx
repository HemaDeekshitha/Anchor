"use client";

import Image from "next/image";
import Header from "./Header/Header";
import landingStyles from "./LandingPage.module.css";
import Box2 from "./Part2/Box2";
import StickyCards from "./Part3/StickyCards";
import WhyChooseUs from "./Part4/WhyChooseUs";
import Testimonials from "./Part5/Testimonials";
import Download from "./Part6/Download";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const ContactPageHandler = () => {
    router.replace("/ContactPage");
  };

  return (
    <>
      <Header />
      <div id="home" className={landingStyles.landingpageContainer}>
        <div className={landingStyles.landingpageMain}>
          <div className={landingStyles.landingpageContent}>
            <h1 className={landingStyles.title}>
              <p className={landingStyles.subtitle}>
                <span className={landingStyles.titledot}></span>
                Your entire job search — organized in one place.
              </p>
              Anchor
              <span className={landingStyles.titleblur}>
                - It's the clarity you deserve
              </span>
            </h1>

          
            {/* <div className={landingStyles.imageColumn}>
            <Image
              src="/assets/an.png"
              alt="Download on the App Store"
              width={400} // Increased size slightly for impact
              height={400}
              className={landingStyles.heroImage}
              priority
            />
          </div> */}
          <div className={landingStyles.heroVisuals}>
  {/* Main Central Image */}
  <Image
    src="/assets/hero1.png"
    alt="Main Hero"
    width={500}
    height={500}
    className={landingStyles.mainImage}
    priority
  />

  {/* Floating Element 1 (Top Left) */}
  <div className={landingStyles.floatIcon1}>
    <Image src="/assets/icon-star.png" alt="" width={120} height={120} />
  </div>

  {/* Floating Element 2 (Top Right) */}
  <div className={landingStyles.floatIcon2}>
    <Image src="/assets/icon-target.png" alt="" width={120} height={120} />
  </div>

  {/* Floating Element 3 (Bottom Left) */}
  <div className={landingStyles.floatIcon3}>
    <Image src="/assets/icon-trophy.png" alt="" width={120} height={120} />
  </div>

  {/* Floating Element 4 (Bottom Right) */}
  <div className={landingStyles.floatIcon4}>
    <Image src="/assets/icon-rocket.png" alt="" width={120} height={120} />
  </div>
</div>

            <div className={landingStyles.landingpageBtns}>
              <button
                className={landingStyles.primaryBtn}
                onClick={ContactPageHandler}
              >
                Get Started
              </button>
              <button className={landingStyles.secondaryBtn}>Learn More</button>
            </div>
          </div>
        </div>
      </div>
      <Box2 />
      <StickyCards />
      <WhyChooseUs />
      <Testimonials />
      <Download />
    </>
  );
}
