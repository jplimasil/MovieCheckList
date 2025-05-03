
import React, { useEffect } from 'react';

const HeartParticles: React.FC = () => {
  useEffect(() => {
    const createHeart = () => {
      const container = document.querySelector('.heart-container');
      if (!container) return;
      
      const heart = document.createElement('div');
      heart.classList.add('heart');
      
      // Random position
      const left = Math.random() * 100;
      const animationDuration = 5 + Math.random() * 5;
      
      heart.style.left = `${left}%`;
      heart.style.animationDuration = `${animationDuration}s`;
      
      container.appendChild(heart);
      
      // Remove heart after animation completes
      setTimeout(() => {
        heart.remove();
      }, animationDuration * 1000);
    };
    
    // Create hearts at random intervals
    const interval = setInterval(createHeart, 1500);
    
    // Create a few hearts immediately
    for (let i = 0; i < 5; i++) {
      setTimeout(createHeart, i * 300);
    }
    
    return () => clearInterval(interval);
  }, []);
  
  return <div className="heart-container absolute inset-0 z-0 pointer-events-none"></div>;
};

export default HeartParticles;
