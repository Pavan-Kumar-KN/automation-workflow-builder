import React from 'react';
import { EdgeLabelRenderer, EdgeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

interface FlowEdgeData {
  onOpenActionModal?: (index: number) => void;
  index?: number;
}

const FlowEdge: React.FC<EdgeProps<FlowEdgeData>> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
  id,
}) => {
  const centerX = sourceX;
  const centerY = (sourceY + targetY) / 2;

  const edgePath = `M ${sourceX},${sourceY} L ${sourceX},${targetY}`;
  const arrowSize = 6;
  const arrowPath = `M ${sourceX - arrowSize},${targetY - arrowSize} L ${sourceX},${targetY} L ${sourceX + arrowSize},${targetY - arrowSize}`;


  console.log("The edge path is : ", data.index);
  console.log("The Data is in the flow edge  : ", data);

  return (
    <>
      {/* Main vertical edge */}
      <path
        id={id}
        d={edgePath}
        stroke="#9CA3AF" // lighter gray
        strokeWidth={1.5}
        fill="none"
        style={style}
      />

      {/* Arrowhead */}
      <path
        d={arrowPath}
        stroke="#9CA3AF" // lighter gray
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Plus Button */}
      {data?.onOpenActionModal && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-auto absolute"
            style={{
              transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
            }}
          >
            <button
              onClick={() => data.onOpenActionModal?.(data.index!)}
              className="w-6 h-5 bg-gray-400 border border-gray-500 rounded-md flex items-center justify-center transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default FlowEdge;