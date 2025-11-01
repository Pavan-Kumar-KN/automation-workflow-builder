import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const ContactTaggedConfig = ({ config, setConfig }) => {
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Initialize selected tags from config
    useEffect(() => {
        if (config?.selectedTags && Array.isArray(config.selectedTags)) {
            setSelectedTags(config.selectedTags);
        }
    }, [config]);

    // Fetch tags from API
    const fetchTags = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setTags([
                'Lead',
                'Customer',
                'Prospect',
                'VIP',
                'Hot Lead',
                'Cold Lead',
                'Subscriber',
                'Trial User',
                'Premium User',
                'Churned'
            ]);
        } catch (error) {
            alert('Failed to fetch tags');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle tag selection
    const handleTagSelect = (tagName) => {
        if (!selectedTags.includes(tagName)) {
            setSelectedTags([...selectedTags, tagName]);
        }
        setIsOpen(false);
    };

    // Handle tag removal
    const handleTagRemove = (tagName) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (selectedTags.length === 0) {
            toast.error('Please select at least one tag');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedTags,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            toast.success('Configuration saved successfully!');
        } catch (error) {
            toast.error('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Contact Tagged</h3>
                <p className="text-sm text-gray-500">When a contact is tagged with any of these tags, automation will trigger.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags-select" className="text-sm font-medium text-gray-700">
                    Tags <span className="text-red-500">*</span>
                </Label>
                
                {/* Multi-select input area */}
                <div className="relative">
                    <div 
                        className="min-h-[40px] w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {selectedTags.length === 0 ? (
                            <span className="text-gray-400">
                                {isLoading ? "Loading tags..." : "Select Tags"}
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {selectedTags.map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm text-gray-700 border"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTagRemove(tag);
                                            }}
                                            className="ml-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Dropdown menu */}
                    {isOpen && !isLoading && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {tags
                                .filter(tag => !selectedTags.includes(tag))
                                .map((tag, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => handleTagSelect(tag)}
                                >
                                    {tag}
                                </div>
                            ))}
                            {tags.filter(tag => !selectedTags.includes(tag)).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    All tags selected
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available tags...</p>
                )}
            </div>

            {/* Show selected tags */}
            {selectedTags.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Selected Tags:</p>
                    <div className="space-y-1">
                        {selectedTags.map((tag, index) => (
                            <p key={index} className="text-sm text-gray-700">• {tag}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Show selected tags count */}
            {selectedTags.length > 0 && (
                <div className="text-sm text-gray-600">
                    Automation will trigger when contact is tagged with any of these {selectedTags.length} tag{selectedTags.length === 1 ? '' : 's'}
                </div>
            )}

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isSubmitting || selectedTags.length === 0}
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default ContactTaggedConfig;