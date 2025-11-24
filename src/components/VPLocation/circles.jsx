import { useState, useEffect } from 'react';
// import {useViewport} from '../VPLocation/ViewPort';
// import { useViewport } from './ViewPort';


// Configuration for the circles
const CIRCLE_CONFIG = {
  count: 60, // At least 50 circles
  minRadius: 5, // Minimum radius in px
  maxRadius: 30, // Maximum radius in px
  colors: ['bg-[#7B3E19] ', 'bg-[#7B3E19]  ', 'bg-[#7B3E19]   ', 'bg-[#7B3E19]'], // Varying gray Tailwind color classes
  // Spread in bottom-right: higher % = more spread from the corner
  maxRightPercent: 95, // Increased for more space to fit 50 without overlap
  maxBottomPercent: 95,
  assumedContainerSize: 1200, // Approximate px size of parent for overlap calculation (adjust if your viewport is much smaller/larger)
  maxPlacementAttempts: 200, // Fallback if can't place without overlap
};

// const {scrollY} = useViewport();
// const { scrollY } = useViewport()


const AnimatedCircles = () => {
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    const placedCircles = [];
    for (let i = 0; i < CIRCLE_CONFIG.count; i++) {
      let attempts = 0;
      let circleData;
      const maxAttempts = CIRCLE_CONFIG.maxPlacementAttempts;

      while (attempts < maxAttempts) {
        const radius = Math.floor(
          Math.random() * (CIRCLE_CONFIG.maxRadius - CIRCLE_CONFIG.minRadius + 1)
        ) + CIRCLE_CONFIG.minRadius;
        const size = radius * 2;
        const color = CIRCLE_CONFIG.colors[Math.floor(Math.random() * CIRCLE_CONFIG.colors.length)];
        const delay = Math.random() * 2; // up to 2 seconds
        const right = Math.random() * CIRCLE_CONFIG.maxRightPercent;
        const bottom = Math.random() * CIRCLE_CONFIG.maxBottomPercent;

        // Convert to left/top % for distance calc
        const x_percent = 100 - right;
        const y_percent = 100 - bottom;

        // Check overlap
        let overlaps = false;
        for (const placed of placedCircles) {
          const dx = Math.abs(x_percent - placed.x_percent);
          const dy = Math.abs(y_percent - placed.y_percent);
          const dist_percent = Math.sqrt(dx * dx + dy * dy);

          // Min distance in % units (scaled by assumed container size)
          const min_dist_percent = ((radius + placed.radius) / CIRCLE_CONFIG.assumedContainerSize) * 100;

          if (dist_percent < min_dist_percent) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          circleData = { id: i, size, color, right, bottom, delay, radius, x_percent, y_percent, isVisible: false };
          placedCircles.push(circleData);
          break;
        }

        attempts++;
      }

      // If max attempts reached, place anyway (rare with increased spread)
      if (!circleData) {
        const radius = Math.floor(
          Math.random() * (CIRCLE_CONFIG.maxRadius - CIRCLE_CONFIG.minRadius + 1)
        ) + CIRCLE_CONFIG.minRadius;
        const size = radius * 2;
        const color = CIRCLE_CONFIG.colors[Math.floor(Math.random() * CIRCLE_CONFIG.colors.length)];
        const delay = Math.random() * 2;
        const right = Math.random() * CIRCLE_CONFIG.maxRightPercent;
        const bottom = Math.random() * CIRCLE_CONFIG.maxBottomPercent;
        const x_percent = 100 - right;
        const y_percent = 100 - bottom;
        circleData = { id: i, size, color, right, bottom, delay, radius, x_percent, y_percent, isVisible: false };
        placedCircles.push(circleData);
      }
    }

    setCircles(placedCircles);
  }, []);

  // Staggered fade-in effect
  useEffect(() => {
    if (circles.length > 0) {
      circles.forEach((circle) => {
        setTimeout(() => {
          setCircles((prev) =>
            prev.map((c) => (c.id === circle.id ? { ...c, isVisible: true } : c))
          );
        }, circle.delay * 1000);
      });
    }
  }, [circles.length]);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 `}>
      {circles.map((circle) => (
        <div
          key={circle.id}
          className={`absolute rounded-full transition-opacity duration-1000 ease-in-out ${
            circle.color
          } ${circle.isVisible ? 'opacity-60 motion-preset-oscillate motion-duration-2000' : 'opacity-0  '}`}
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            right: `${circle.right}%`,
            bottom: `${circle.bottom}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedCircles;