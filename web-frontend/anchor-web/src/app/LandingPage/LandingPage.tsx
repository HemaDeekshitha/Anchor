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
export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

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
                - Your job search, anchored in clarity
              </span>
            </h1>

            <Image
              src="/assets/an.png"
              alt="Download on the App Store"
              width={400}
              height={400}
              className={landingStyles.heroImage}
              priority
            />

            <div className={landingStyles.landingpageBtns}>
              <button className={landingStyles.primaryBtn}>Get Started</button>
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
