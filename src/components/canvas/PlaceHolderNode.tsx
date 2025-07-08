import React from 'react'
import * as LucideIcons from 'lucide-react';

interface PlaceHolderNodeProps {
    branchType: 'branch1' | 'otherwise';
    handleAddNodeToBranch: (branchType: 'branch1' | 'otherwise') => void;
}

// border-2 border-dashed rounded-full
const PlaceHolderNode: React.FC<PlaceHolderNodeProps> = ({ branchType, handleAddNodeToBranch }) => {
    return (
        <div className="flex flex-col items-center pt-6 pb-4">
            {/* Placeholder styled like a node card with proper alignment */}
            <div className="relative flex flex-col items-center">
                {/* Top vertical line - connects from ConnectCanvas line to placeholder box */}
                {/* <div className="w-0.5 h-6 bg-gray-400 mb-2" /> */}

                {/* Placeholder box */}
                <div
                    onClick={() => handleAddNodeToBranch(branchType)}
                    className=" shadow-sm p-6 w-52 flex flex-col items-center justify-center cursor-pointer "
                >
                    <LucideIcons.Plus className="w-4 h-4 text-gray-400 mb-2 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-colors" />
                    <p className="text-sm text-gray-500">Add action</p>
                </div>
            </div>
        </div>
    )
}

export default PlaceHolderNode