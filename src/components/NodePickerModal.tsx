import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface NodeOption {
  id: string;
  icon: keyof typeof LucideIcons;
  label: string;
  description?: string;
}

interface NodePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (option: NodeOption) => void;
  type: 'trigger' | 'action';
  nodeOptions: NodeOption[];
}

export const NodePickerModal: React.FC<NodePickerModalProps> = ({ open, onClose, onSelect, type, nodeOptions }) => {
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filteredOptions = nodeOptions.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <LucideIcons.X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {type === 'trigger' ? 'Select a Trigger' : 'Select an Action'}
        </h2>

        {/* Search bar */}
        <input
          type="text"
          className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Search ${type === 'trigger' ? 'triggers' : 'actions'}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Options list */}
        <div className="max-h-72 overflow-y-auto space-y-2">
          {filteredOptions.length === 0 && (
            <div className="text-gray-400 text-center py-8">No {type}s found.</div>
          )}
          {filteredOptions.map(option => {
            const Icon = LucideIcons[option.icon] || LucideIcons.Box;
            return (
              <button
                key={option.id}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition group"
                onClick={() => onSelect(option)}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200">
                  <Icon className="w-6 h-6 text-blue-600" />
                </span>
                <span className="flex-1 text-left">
                  <span className="block text-base font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <span className="block text-xs text-gray-500 mt-0.5">{option.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 