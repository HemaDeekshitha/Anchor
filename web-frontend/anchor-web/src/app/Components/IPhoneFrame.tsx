import React from 'react';
import styles from './IPhoneFrame.module.css';

interface IPhoneFrameProps {
  children: React.ReactNode; 
  width?: string;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({ 
  children, 
  width = "300px" 
}) => {
  return (
    <div className={styles.iphoneFrame} style={{ width }}>
      
     

      {/* The Notch / Dynamic Island */}
      {/* <div className={styles.dynamicIsland}></div> */}
      
      {/* This renders your app screenshot */}
      {children}
      
      {/* Bottom Home Indicator */}
      {/* <div className={styles.homeIndicator}></div> */}

    </div>
  );
};