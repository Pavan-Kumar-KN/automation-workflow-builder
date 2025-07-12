import React from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { Plus } from 'lucide-react';

interface ConditionEdgeData {
  onOpenActionModal?: (index: number) => void;
  index?: number;
}

const ConditionEdge = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  label,
  data
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  label?: string;
  data?: ConditionEdgeData;
}) => {
  const curveRadius = 30;
  const verticalDrop = 50;
  const directionX = targetX > sourceX ? 1 : -1;
  
  const curveStartY = sourceY + verticalDrop;
  const curveMidX = targetX - directionX * curveRadius;
  const curveEndY = curveStartY + curveRadius;
  
  const path = `
    M ${sourceX},${sourceY}
    L ${sourceX},${curveStartY - curveRadius}
    Q ${sourceX},${curveStartY} ${sourceX + directionX * curveRadius},${curveStartY}
    L ${curveMidX},${curveStartY}
    Q ${targetX},${curveStartY} ${targetX},${curveEndY}
    L ${targetX},${targetY}
  `;
  
  const labelX = (sourceX + targetX) / 2;
  const labelY = curveStartY - 15;
  
  // Plus button position (at the middle of the curved section)
  const plusX = labelX;
  const plusY = curveStartY;
  
  // Create arrowhead path
  const arrowSize = 6;
  const arrowPath = `M ${targetX - arrowSize},${targetY - arrowSize} L ${targetX},${targetY} L ${targetX + arrowSize},${targetY - arrowSize}`;
  
  return (
    <>
      {/* Edge path */}
      <path
        id={id}
        d={path}
        stroke="#9ca3af"
        strokeWidth={2}
        fill="none"
      />
      
      {/* Arrowhead */}
      <path
        d={arrowPath}
        stroke="#9ca3af"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Edge label */}
      {label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fill="#4b5563"
          fontSize="12"
          className="font-medium"
        >
          {label}
        </text>
      )}
      
      {/* Plus button at center */}
      {data?.onOpenActionModal && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-auto absolute"
            style={{
              transform: `translate(-50%, -50%) translate(${plusX}px, ${plusY}px)`,
            }}
          >
            <button
              onClick={() => data.onOpenActionModal?.(data.index!)}
              className="w-6 h-6 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Plus className="w-3 h-3 text-slate-600 hover:text-blue-600" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default ConditionEdge;