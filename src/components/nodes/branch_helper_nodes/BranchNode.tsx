import React from 'react';

const BranchNode = ({
    label = "Branch 1",
    isActive = false,
    onClick = () => { },
    className = ""
}) => {
    return (
        <div
            className={`
        relative inline-flex items-center justify-center
        w-20 h-8 
        bg-blue-50 border-2 border-blue-200 
        rounded-md cursor-pointer
        transition-all duration-200 ease-in-out
        hover:bg-blue-100 hover:border-blue-300
        ${isActive ? 'ring-2 ring-blue-400 bg-blue-100' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {/* Diamond shape indicator */}
            <div className="absolute -left-1 w-2 h-2 bg-blue-400 transform rotate-45 rounded-sm"></div>

            {/* Label */}
            <span className="text-xs font-medium text-blue-700 px-1 truncate">
                {label}
            </span>

            {/* Connection points */}
            <div className="absolute -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        </div>
    );
};


export default BranchNode;