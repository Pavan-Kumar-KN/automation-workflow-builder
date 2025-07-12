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
  const verticalDrop = 35;
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
  const labelY = curveStartY - 20;
  
  // Plus button position (at the middle of the curved section)
  const plusX = labelX;
  const plusY = curveStartY;
  
  // Create arrowhead path
  const arrowSize = 5;
  const arrowPath = `M ${targetX - arrowSize},${targetY - arrowSize} L ${targetX},${targetY} L ${targetX + arrowSize},${targetY - arrowSize}`;
  
  return (
    <>
      {/* Edge path */}
      <path
        id={id}
        d={path}
        stroke="#9ca3af"
        strokeWidth={1.5}
        fill="none"
      />
      
      {/* Arrowhead */}
      <path
        d={arrowPath}
        stroke="#9ca3af"
        strokeWidth={1.5}
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




// import React from 'react';
// import { EdgeLabelRenderer } from '@xyflow/react';
// import { Plus } from 'lucide-react';

// interface ConditionEdgeData {
//   onOpenActionModal?: (index: number) => void;
//   index?: number;
//   hasNodes?: boolean; // Flag to indicate if nodes are added below this branch
// }

// // BranchNode component
// const BranchNode = ({
//   label = "Branch 1",
//   isActive = false,
//   onClick = () => { },
//   className = ""
// }) => {
//   return (
//     <div
//       className={`
//         relative inline-flex items-center justify-center
//         w-20 h-8 
//         bg-blue-50 border-2 border-blue-200 
//         rounded-md cursor-pointer
//         transition-all duration-200 ease-in-out
//         hover:bg-blue-100 hover:border-blue-300
//         ${isActive ? 'ring-2 ring-blue-400 bg-blue-100' : ''}
//         ${className}
//       `}
//       onClick={onClick}
//     >
//       {/* Diamond shape indicator */}
//       <div className="absolute -left-1 w-2 h-2 bg-blue-400 transform rotate-45 rounded-sm"></div>
      
//       {/* Label */}
//       <span className="text-xs font-medium text-blue-700 px-1 truncate">
//         {label}
//       </span>
      
//       {/* Connection points */}
//       <div className="absolute -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
//     </div>
//   );
// };

// const ConditionEdge = ({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   label,
//   data
// }: {
//   id: string;
//   sourceX: number;
//   sourceY: number;
//   targetX: number;
//   targetY: number;
//   label?: string;
//   data?: ConditionEdgeData;
// }) => {
//   const curveRadius = 30;
//   const verticalDrop = 35;
//   const directionX = targetX > sourceX ? 1 : -1;
//   const curveStartY = sourceY + verticalDrop;
//   const curveMidX = targetX - directionX * curveRadius;
//   const curveEndY = curveStartY + curveRadius;

//   // Reduce the line length - stop before reaching the target
//   const reducedTargetY = targetY - 50;

//   const path = `
//     M ${sourceX},${sourceY}
//     L ${sourceX},${curveStartY - curveRadius}
//     Q ${sourceX},${curveStartY} ${sourceX + directionX * curveRadius},${curveStartY}
//     L ${curveMidX},${curveStartY}
//     Q ${targetX},${curveStartY} ${targetX},${curveEndY}
//     L ${targetX},${reducedTargetY}
//   `;

//   const labelX = (sourceX + targetX) / 2;
//   const labelY = curveStartY - 10;

//   // Branch node position at the end point
//   const branchX = targetX;
//   const branchY = reducedTargetY + 20; // Position below the ending

//   // Additional line below the branch node (when nodes are added)
//   const extensionLineStartY = branchY + 20; // Start below the branch node
//   const extensionLineEndY = extensionLineStartY + 40; // Length of the extension line
//   const extensionLinePath = `M ${targetX},${extensionLineStartY} L ${targetX},${extensionLineEndY}`;
  
//   // Arrowhead for the extension line
//   const arrowSize = 6;
//   const arrowPath = `M ${targetX - arrowSize},${extensionLineEndY - arrowSize} L ${targetX},${extensionLineEndY} L ${targetX + arrowSize},${extensionLineEndY - arrowSize}`;

//   // Center point for plus button on extension line
//   const extensionCenterY = (extensionLineStartY + extensionLineEndY) / 2;

//   // Determine branch label based on the edge label or index
//   const getBranchLabel = () => {
//     if (label === "Yes" || data?.index === 0) {
//       return "Branch 1";
//     } else if (label === "No" || data?.index === 1) {
//       return "Otherwise";
//     }
//     return "Branch 1"; // Default
//   };

//   const handleBranchClick = () => {
//     if (data?.onOpenActionModal && data?.index !== undefined) {
//       data.onOpenActionModal(data.index);
//     }
//   };

//   const handleExtensionClick = () => {
//     if (data?.onOpenActionModal && data?.index !== undefined) {
//       data.onOpenActionModal(data.index + 10); // Different index for extension line
//     }
//   };

//   return (
//     <>
//       {/* Edge path - no arrowhead */}
//       <path
//         id={id}
//         d={path}
//         stroke="#9CA3AF"
//         strokeWidth={1.5}
//         fill="none"
//       />

//       {/* Edge label */}
//       {label && (
//         <text
//           x={labelX}
//           y={labelY}
//           textAnchor="middle"
//           fill="#4B5563"
//           fontSize="12"
//           className="font-medium"
//         >
//           {label}
//         </text>
//       )}

//       {/* Branch node at the end point using EdgeLabelRenderer */}
//       <EdgeLabelRenderer>
//         <div
//           style={{
//             position: 'absolute',
//             transform: `translate(-50%, -50%) translate(${branchX}px, ${branchY}px)`,
//             pointerEvents: 'all',
//           }}
//         >
//           <BranchNode
//             label={getBranchLabel()}
//             onClick={handleBranchClick}
//           />
//         </div>
//       </EdgeLabelRenderer>

//       {/* Extension line below branch node (when nodes are added) */}
//       {data?.hasNodes && (
//         <>
//           {/* Extension line */}
//           <path
//             d={extensionLinePath}
//             stroke="#9CA3AF"
//             strokeWidth={1.5}
//             fill="none"
//           />
          
//           {/* Arrowhead for extension line */}
//           <path
//             d={arrowPath}
//             stroke="#9CA3AF"
//             strokeWidth={1.5}
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />

//           {/* Plus button on extension line */}
//           <EdgeLabelRenderer>
//             <div
//               style={{
//                 position: 'absolute',
//                 transform: `translate(-50%, -50%) translate(${targetX}px, ${extensionCenterY}px)`,
//                 pointerEvents: 'all',
//               }}
//             >
//               <button
//                 onClick={handleExtensionClick}
//                 className="w-6 h-5 bg-gray-400 border border-gray-500 rounded-md flex items-center justify-center transition-colors shadow-sm"
//               >
//                 <Plus className="w-4 h-4 text-white stroke-[2.5]" />
//               </button>
//             </div>
//           </EdgeLabelRenderer>
//         </>
//       )}
//     </>
//   );
// };

// export default ConditionEdge;