"use client";

import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils.js";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

/**
 * AnimatedBeam - Creates an animated connecting beam between two elements
 * 
 * @param {Object} props
 * @param {React.RefObject} props.containerRef - Reference to the container element
 * @param {React.RefObject} props.fromRef - Reference to the source element
 * @param {React.RefObject} props.toRef - Reference to the target element
 * @param {number} props.curvature - Curvature amount for the bezier curve (positive or negative)
 * @param {number} props.endYOffset - Y-offset for the end point
 * @param {boolean} props.reverse - Whether to reverse the animation direction
 * @param {string} props.className - Additional CSS classes
 */
export const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  endYOffset = 0,
  reverse = false,
  className,
}) => {
  const [path, setPath] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const calculatePath = useCallback(() => {
    if (!fromRef?.current || !toRef?.current || !containerRef?.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const from = fromRef.current.getBoundingClientRect();
    const to = toRef.current.getBoundingClientRect();

    // Get positions relative to container
    const startX = from.left + from.width / 2 - container.left;
    const startY = from.top + from.height / 2 - container.top;
    const endX = to.left + to.width / 2 - container.left;
    const endY = to.top + to.height / 2 - container.top + (endYOffset || 0);

    // Calculate control points for the curve
    const deltaX = endX - startX;
    const controlOffset = deltaX * 0.3 * (curvature ? curvature / 100 : 0.5);
    
    // Create SVG path
    const pathData = `M ${startX},${startY} C ${startX + controlOffset},${startY} ${endX - controlOffset},${endY} ${endX},${endY}`;
    
    setPath(pathData);
    setDimensions({
      width: container.width,
      height: container.height,
    });
  }, [fromRef, toRef, containerRef, curvature, endYOffset]);

  useEffect(() => {
    calculatePath();
    window.addEventListener("resize", calculatePath);
    return () => window.removeEventListener("resize", calculatePath);
  }, [calculatePath]);

  if (!path) return null;

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      className="absolute top-0 left-0 pointer-events-none"
    >
      <motion.path
        d={path}
        className={cn("fill-none", className)}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          direction: reverse ? -1 : 1,
        }}
      />
    </svg>
  );
};

AnimatedBeam.propTypes = {
  containerRef: PropTypes.object.isRequired,
  fromRef: PropTypes.object.isRequired,
  toRef: PropTypes.object.isRequired,
  curvature: PropTypes.number,
  endYOffset: PropTypes.number,
  reverse: PropTypes.bool,
  className: PropTypes.string
}; 