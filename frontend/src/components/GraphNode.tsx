import React from 'react';
import { motion } from 'framer-motion';

interface GraphNodeProps {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  isDiscovered: boolean;
  nodeType: 'user' | 'category' | 'item';
}

const GraphNode: React.FC<GraphNodeProps> = React.memo(({
  x,
  y,
  label,
  color,
  size,
  isDiscovered,
  nodeType,
}) => {
  const nodeVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const labelVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.15,
        duration: 0.2,
      },
    },
  };

  // Size mapping
  const radiusMap = {
    sm: 6,
    md: 10,
    lg: 14,
  };

  const fontSizeMap = {
    sm: '10px',
    md: '11px',
    lg: '13px',
  };

  const radius = radiusMap[size];
  const fontSize = fontSizeMap[size];

  if (!isDiscovered) return null;

  return (
    <motion.g variants={nodeVariants} initial="hidden" animate="visible">
      {/* Circle */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        stroke="white"
        strokeWidth={nodeType === 'user' ? 3 : 2}
      />

      {/* Label */}
      <motion.text
        x={x}
        y={y + radius + 14}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={nodeType === 'category' ? 600 : 400}
        fill="currentColor"
        className="select-none"
        variants={labelVariants}
      >
        {label}
      </motion.text>
    </motion.g>
  );
});

GraphNode.displayName = 'GraphNode';

export default GraphNode;
