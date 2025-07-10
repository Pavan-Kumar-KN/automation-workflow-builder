import React from 'react'
import * as LucideIcons from 'lucide-react'

const FlowEdge = ({ onOpenActionModal, index}) => {
    return (
        <div className="flex flex-col items-center relative">
            {/* Uniform vertical lines - compact height */}
            <div className="w-0.5 h-6 bg-gray-400"></div>
            <div className="relative">
                <button
                    onClick={() => onOpenActionModal(index)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                >
                    <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                </button>
            </div>
            <div className="w-0.5 h-6 bg-gray-400"></div>
        </div>
    )
}

export default FlowEdge