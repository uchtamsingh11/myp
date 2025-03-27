"use client";

import { cn } from "../../lib/utils";
import React, { useEffect, useState } from "react";

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}) => {
  const [meteorStyles, setMeteorStyles] = useState([]);

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      "--angle": angle + "deg",
      top: Math.floor(Math.random() * -10) - 5, // Random starting position above viewport
      left: `calc(-20% + ${Math.floor(Math.random() * 140)}%)`,
      animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
      animationDuration:
        Math.floor(Math.random() * (maxDuration - minDuration) + minDuration) +
        "s",
    }));
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  const meteorColors = [
    "bg-white",
    "bg-blue-300",
    "bg-indigo-300",
    "bg-purple-300"
  ];

  const tailColors = [
    "from-white",
    "from-blue-300",
    "from-indigo-300",
    "from-purple-300"
  ];

  const shadowColors = [
    "shadow-[0_0_10px_#ffffff]",
    "shadow-[0_0_10px_#93c5fd]",
    "shadow-[0_0_10px_#a5b4fc]",
    "shadow-[0_0_10px_#d8b4fe]"
  ];

  return (
    <>
      {[...meteorStyles].map((style, idx) => {
        const colorIndex = idx % meteorColors.length;
        return (
          // Meteor Head
          <span
            key={idx}
            style={{ ...style }}
            className={cn(
              `pointer-events-none absolute size-2 rotate-[var(--angle)] animate-meteor rounded-full ${meteorColors[colorIndex]} ${shadowColors[colorIndex]} z-[5]`,
              className,
            )}
          >
            {/* Meteor Tail */}
            <div className={`pointer-events-none absolute top-1/2 -z-10 h-[2px] w-[200px] -translate-y-1/2 bg-gradient-to-r ${tailColors[colorIndex]} to-transparent`} />
          </span>
        );
      })}
    </>
  );
}; 