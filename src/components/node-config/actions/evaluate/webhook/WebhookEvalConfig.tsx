import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const WebhookEvalConfig = ({ config, setConfig }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [tagInput, setTagInput] = useState('');

    // Sample tags (you can replace with your actual tags from API)
    const availableTags = [
        'customer', 'lead', 'prospect', 'vip', 'new', 'returning', 
        'premium', 'basic', 'trial', 'churned', 'active', 'inactive'
    ];


    // Handle tag selection
    const handleTagSelect = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Handle tag removal
    const handleTagRemove = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    // Handle custom tag input
    const handleTagInputKeyPress = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            handleTagSelect(tagInput.trim());
            setTagInput('');
        }
    };

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (selectedTags.length === 0) {
                alert('Please select at least one tag');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            
            // setConfig(newConfig);
            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Description */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Tagged</h3>
                <p className="text-sm text-gray-500">
                    Send a cheer message to contact whenever contact is tagged in system even with other automation.
                </p>
            </div>

            {/* Tags Section */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Tags
                </label>
                
                {/* Tag Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        placeholder="Select tags"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    {/* Dropdown with available tags */}
                    {tagInput && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {availableTags
                                .filter(tag => 
                                    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
                                    !selectedTags.includes(tag)
                                )
                                .map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            handleTagSelect(tag);
                                            setTagInput('');
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                    >
                                        {tag}
                                    </button>
                                ))
                            }
                            {tagInput.trim() && 
                             !availableTags.includes(tagInput.trim()) && 
                             !selectedTags.includes(tagInput.trim()) && (
                                <button
                                    onClick={() => {
                                        handleTagSelect(tagInput.trim());
                                        setTagInput('');
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200"
                                >
                                    Add "{tagInput.trim()}"
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedTags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                                {tag}
                                <button
                                    onClick={() => handleTagRemove(tag)}
                                    className="ml-2 hover:text-blue-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            <div className="space-y-3">
                <div className="text-sm text-gray-700">
                    More All Bottom Action (selected in red)
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleBulkAction('yes')}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                            bulkAction === 'yes' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Move all action to Yes node
                    </button>
                    <button
                        onClick={() => handleBulkAction('no')}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                            bulkAction === 'no' 
                                ? 'bg-gray-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Move all action to No node
                    </button>
                </div>
            </div>

            {/* Confirm Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default WebhookEvalConfig;