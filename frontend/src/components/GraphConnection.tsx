import React from 'react';
import { motion } from 'framer-motion';

interface GraphConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isDiscovered: boolean;
  color: string;
}

const GraphConnection: React.FC<GraphConnectionProps> = React.memo(({ from, to, isDiscovered, color }) => {
  // Calculate quadratic Bezier curve control point
  // Place control point between the two points for a smooth curve
  const controlX = (from.x + to.x) / 2;
  const controlY = (from.y + to.y) / 2;

  // Create SVG path string for quadratic Bezier curve
  const pathData = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

  const connectionVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 0.4,
      transition: {
        pathLength: { duration: 0.4, ease: 'easeOut' },
        opacity: { duration: 0.2 },
      },
    },
  };

  if (!isDiscovered) return null;

  return (
    <motion.path
      d={pathData}
      stroke={color}
      strokeWidth="2"
      fill="none"
      variants={connectionVariants}
      initial="hidden"
      animate="visible"
    />
  );
});

GraphConnection.displayName = 'GraphConnection';

export default GraphConnection;
