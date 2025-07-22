import { useState } from 'react';
import { useGraphStore } from '@/store/useGraphStore';

interface NotesPopoverProps {
    nodeId: string;
    onClose: () => void;
}

const NotesPopover = ({ nodeId, onClose }: NotesPopoverProps) => {
    const graph = useGraphStore(state => state.nodes);
    const updateNode = useGraphStore(state => state.updateNodeData);
    const node = graph[nodeId];

    const [notes, setNotes] = useState(node?.data?.notes || '');

    const handleSave = () => {
        updateNode(nodeId, { notes });
        onClose();
    };

    const inlineClose = () => {
        handleSave();
        onClose();
    }

    // Prevent event bubbling to avoid triggering node click events
    const handlePopoverClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handlePopoverDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleTextareaDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Allow normal text selection behavior
    };

    return (
        <div
            className="notes-popover w-[280px] sm:w-[320px] p-4 rounded-xl border border-gray-200 shadow-xl bg-white text-sm transition-all"
            onClick={handlePopoverClick}
            onDoubleClick={handlePopoverDoubleClick}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Notes
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        inlineClose();
                    }}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    title="Close"
                >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Textarea */}
            <textarea
                className="w-full h-32 sm:h-36 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700 leading-relaxed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onClick={handlePopoverClick}
                onDoubleClick={handleTextareaDoubleClick}
                placeholder="Add your notes here..."
                autoFocus
            />

            {/* Character count */}
            <div className="text-right text-xs mt-2 text-gray-500 font-medium">
                {notes.length} characters • {notes.trim().split(/\s+/).filter(Boolean).length} words
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
                <p className="text-xs text-gray-400">
                    💡 Notes are saved with workflow
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            inlineClose();
                        }}
                        className="flex-1 sm:flex-none px-3 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-600"
                    >
                        Cancel
                    </button>
                    {/* <button
                        onClick={handleSave}
                        className="flex-1 sm:flex-none px-3 py-1 text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-sm whitespace-nowrap"
                    >
                        Save Notes
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default NotesPopover;
