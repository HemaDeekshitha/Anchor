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
// Removed unnecessary motion hooks for the stacking effect

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
                - it's the clarity you deserve
              </span>
            </h1>

            <div className={landingStyles.heroVisuals}>
              <Image
                src="/assets/hero1.png"
                alt="Main Hero"
                width={500}
                height={500}
                className={landingStyles.mainImage}
                priority
              />
              <div className={landingStyles.floatIcon1}>
                <Image src="/assets/icon-star.png" alt="" width={120} height={120} />
              </div>
              <div className={landingStyles.floatIcon2}>
                <Image src="/assets/icon-target.png" alt="" width={120} height={120} />
              </div>
              <div className={landingStyles.floatIcon3}>
                <Image src="/assets/icon-trophy.png" alt="" width={120} height={120} />
              </div>
              <div className={landingStyles.floatIcon4}>
                <Image src="/assets/icon-rocket.png" alt="" width={120} height={120} />
              </div>
            </div>

            <div className={landingStyles.landingpageBtns}>
              <button className={landingStyles.primaryBtn} onClick={ContactPageHandler}>
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

      {/* --- STACKING LOGIC START --- */}
      
      {/* 1. The Bottom Card (Testimonials) 
          This sticks in place so the next section can slide over it. */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          // height: '100vh', // Ensures it takes full height while stuck
          zIndex: 1,
          display: 'flex',
          alignItems: 'center', // Optional: centers content vertically
          justifyContent: 'center' 
        }}
      >
        <Testimonials />
      </div>

      {/* 2. The Top Card (Download) 
          This slides naturally over the sticky element. 
          IMPORTANT: This component MUST have a solid background color in its CSS, 
          otherwise you will see the Testimonials underneath it. */}
      <div 
        style={{ 
          position: 'relative', 
          height:'100vh',
          zIndex: 20, 
          backgroundColor: 'white', // CHANGE THIS to match your app background (e.g., #ffffff or your dark theme color)
          
        }}
      >
        <Download />
      </div>

      {/* --- STACKING LOGIC END --- */}

    </>
  );
}