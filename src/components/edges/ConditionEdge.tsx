import React from 'react';

interface ConditionEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  markerEnd?: string;
  label?: string;
}

// Custom Edge Component
const ConditionEdge: React.FC<ConditionEdgeProps> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  markerEnd, 
  label 
}) => {
  // Calculate a mid-point on Y axis for the horizontal segment (40px below sourceY)
  const midY: number = sourceY + 40;

  // Construct path with vertical, horizontal, then vertical segments (orthogonal style)
  const path: string = `
    M ${sourceX},${sourceY}
    L ${sourceX},${midY}
    L ${targetX},${midY}
    L ${targetX},${targetY}
  `;

  return (
    <>
      <path
        id={id}
        d={path}
        stroke="#9ca3af"
        strokeWidth={2}
        fill="none"
        markerEnd={markerEnd}
      />
      {label && (
        <text>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" fill="#4b5563" fontSize="12">
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default ConditionEdge;