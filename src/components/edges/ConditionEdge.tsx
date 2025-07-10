import React from 'react';
import * as LucideIcons from 'lucide-react';

interface ConditionEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  markerEnd?: string;
  label?: string;
  data?: {
    branchType?: 'yes' | 'no';
    onAddNode?: (branchType: string) => void;
  };
}

// Custom Edge Component
const ConditionEdge: React.FC<ConditionEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  label,
  data
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

  // Calculate position for plus button (middle of the edge)
  const buttonX = (sourceX + targetX) / 2;
  const buttonY = midY;

  const handleAddNode = () => {
    if (data?.onAddNode && data?.branchType) {
      data.onAddNode(data.branchType);
    }
  };

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

      {/* Branch label */}
      {label && (
        <text
          x={buttonX}
          y={buttonY - 20}
          textAnchor="middle"
          fill="#4b5563"
          fontSize="12"
          className="font-medium"
        >
          {label}
        </text>
      )}
    </>
  );
};

export default ConditionEdge;