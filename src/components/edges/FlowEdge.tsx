// import React from 'react';
// import * as LucideIcons from 'lucide-react';

// const FlowEdge = ({ onOpenActionModal, index }) => {
//     console.log('FlowEdge index:', index);

//     return (
//         <div className="flex flex-col items-center relative">

//             {/* Vertical line above the button */}
//             <div className="w-0.5 h-6 bg-gray-400"></div>

//             {/* Plus Button */}
//             <div className="relative">
//                 <button
//                     onClick={() => onOpenActionModal(index)}
//                     className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
//                 >
//                     <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
//                 </button>
//             </div>

//             {/* Vertical line below the button */}
//             <div className="w-0.5 h-6 bg-gray-400"></div>

//         </div>
//     );
// };

// export default FlowEdge;

import React from 'react';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';
import { Plus } from 'lucide-react';

// Helper function to draw a straight vertical line
const getStraightPath = ({ sourceX, sourceY, targetX, targetY }) => {
    // For vertical layout, use the source X position to keep it straight
    const edgePath = `M ${sourceX},${sourceY} L ${sourceX},${targetY}`;
    const labelX = sourceX; // Use source X position for vertical alignment
    const labelY = (sourceY + targetY) / 2;
    return [edgePath, labelX, labelY];
};

const FlowEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) => {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {data?.onOpenActionModal && (
                <EdgeLabelRenderer>
                    <div
                        className="pointer-events-auto absolute"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    >
                        {/* Container for the entire plus button with lines */}
                        <div className="flex flex-col items-center">
                            {/* Vertical line above the button */}
                            <div className="w-0.5 h-4 bg-gray-400"></div>

                            {/* Plus Button - Remove the absolute positioning */}
                            <button
                                onClick={() => data.onOpenActionModal(data.index)}
                                className="w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                            >
                                <Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                            </button>

                            {/* Vertical line below the button */}
                            <div className="w-0.5 h-4 bg-gray-400"></div>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default FlowEdge;
