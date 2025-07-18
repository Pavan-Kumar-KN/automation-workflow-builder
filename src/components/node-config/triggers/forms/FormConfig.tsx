import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const FormConfig = ({ config, setConfig }) => {
    const [forms, setForms] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Initialize selected forms from config
    useEffect(() => {
        if (config?.selectedForms && Array.isArray(config.selectedForms)) {
            setSelectedForms(config.selectedForms);
        }
    }, [config]);

    // Fetch product forms from API
    const fetchProductForms = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setForms([
                'Product Enquiry Form 1',
                'Product Enquiry Form 2',
                'Product Enquiry Form 3',
                'Advanced Product Form',
                'Quick Enquiry Form',
                'Webinar Funnel',
                'VSL Form',
                'Contact Form',
                'Newsletter Signup'
            ]);
        } catch (error) {
            alert('Failed to fetch product forms');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form selection
    const handleFormSelect = (formName) => {
        if (!selectedForms.includes(formName)) {
            setSelectedForms([...selectedForms, formName]);
        }
        setIsOpen(false);
    };

    // Handle form removal
    const handleFormRemove = (formName) => {
        setSelectedForms(selectedForms.filter(form => form !== formName));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (selectedForms.length === 0) {
            alert('Please select at least one form');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedForms,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchProductForms();
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Forms</h3>
                <p className="text-sm text-gray-500">Select the form which you need to automate</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="product-form" className="text-sm font-medium text-gray-700">
                    Forms <span className="text-red-500">*</span>
                </Label>
                
                {/* Multi-select input area */}
                <div className="relative">
                    <div 
                        className="min-h-[40px] w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {selectedForms.length === 0 ? (
                            <span className="text-gray-400">
                                {isLoading ? "Loading forms..." : "Select forms from the list"}
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {selectedForms.map((form, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm text-gray-700 border"
                                    >
                                        {form}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFormRemove(form);
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
                            {forms
                                .filter(form => !selectedForms.includes(form))
                                .map((form, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => handleFormSelect(form)}
                                >
                                    {form}
                                </div>
                            ))}
                            {forms.filter(form => !selectedForms.includes(form)).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    All forms selected
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available forms...</p>
                )}
            </div>

            {/* Show selected forms count */}
            {selectedForms.length > 0 && (
                <div className="text-sm text-gray-600">
                    {selectedForms.length} form{selectedForms.length === 1 ? '' : 's'} selected
                </div>
            )}

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isSubmitting || selectedForms.length === 0}
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default FormConfig;