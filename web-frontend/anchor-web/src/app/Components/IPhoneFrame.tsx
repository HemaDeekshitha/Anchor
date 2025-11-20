import React from 'react';
import styles from './IPhoneFrame.module.css';


// The interface now accepts 'children' instead of 'imageSrc'
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
      {/* The Notch */}
      <div className={styles.dynamicIsland}></div>
      
      {/* This renders the Next.js Image you passed in StickyCards */}
      {children}
      
    </div>
  );
};