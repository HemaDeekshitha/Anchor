import Image from "next/image";
import Header from "./Header";
import landingStyles from "./LandingPage.module.css";
export default function page() {
  return (
    <div className={landingStyles.landingpageContainer}>
      <Header />
      <div className={landingStyles.landingpageMain}>
        <div className={landingStyles.landingpageContent}>
          <h1 className={landingStyles.title}>
            Fintro - bring visibility to your personal finance
          </h1>

          <Image
            src="/assets/an.png"
            alt="Download on the App Store"
            width={400}
            height={400}
            className={landingStyles.heroImage}
          />

          <div className={landingStyles.landingpageBtns}>
            <button className={landingStyles.primaryBtn}>Get Started</button>
            <button className={landingStyles.secondaryBtn}>Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
}
