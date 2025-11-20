import React from 'react';
import './Marquee.css'; 

interface InfiniteMarqueeProps {
  items: React.ReactNode[];
  speed?: number; 
  direction?: 'left' | 'right';
  className?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  items,
  speed = -100,
  direction = 'left',
  className = '',
}) => {
  return (
    <div className={`marquee-container ${className}`}>
      <div
        className={`marquee-track ${direction === 'right' ? 'reverse' : ''}`}
        // FIX: We set animationDuration directly here
        style={{ animationDuration: `${speed}s` }}
      >
        {items.map((item, index) => (
          <div key={`original-${index}`} className="marquee-item">
            {item}
          </div>
        ))}

        {items.map((item, index) => (
          <div key={`duplicate-${index}`} className="marquee-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};