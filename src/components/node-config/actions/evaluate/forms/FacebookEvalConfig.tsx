import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const FacebookFormEvalConfig = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFacebookPage, setSelectedFacebookPage] = useState('');
    const [selectedForm, setSelectedForm] = useState('');
    const [bulkAction, setBulkAction] = useState('');
    const [facebookPageOptions, setFacebookPageOptions] = useState([]);
    const [formOptions, setFormOptions] = useState([]);

    // Fetch Facebook Pages data
    const fetchFacebookPages = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Sample Facebook Pages data
            const pageData = [
                { value: 'page_1', label: 'Business Page - Main' },
                { value: 'page_2', label: 'Company Marketing Page' },
                { value: 'page_3', label: 'Product Launch Page' },
                { value: 'page_4', label: 'Customer Support Page' },
                { value: 'page_5', label: 'Events & Promotions' },
                { value: 'page_6', label: 'Community Page' },
                { value: 'page_7', label: 'Brand Ambassador Page' },
                { value: 'page_8', label: 'Local Business Page' }
            ];
            
            setFacebookPageOptions(pageData);
        } catch (error) {
            console.error('Failed to fetch Facebook pages:', error);
            alert('Failed to load Facebook pages data');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Forms data
    const fetchForms = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Sample Forms data
            const formData = [
                { value: 'form_1', label: 'Lead Generation Form' },
                { value: 'form_2', label: 'Contact Information Form' },
                { value: 'form_3', label: 'Newsletter Signup' },
                { value: 'form_4', label: 'Product Interest Form' },
                { value: 'form_5', label: 'Event Registration' },
                { value: 'form_6', label: 'Consultation Request' },
                { value: 'form_7', label: 'Feedback Survey' },
                { value: 'form_8', label: 'Quote Request Form' }
            ];
            
            setFormOptions(formData);
        } catch (error) {
            console.error('Failed to fetch forms:', error);
            alert('Failed to load forms data');
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchFacebookPages();
        fetchForms();
    }, []);

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate selections
            if (!selectedFacebookPage) {
                alert('Please select a Facebook Page');
                return;
            }

            if (!selectedForm) {
                alert('Please select a Form');
                return;
            }

            if (!bulkAction) {
                alert('Please select a bulk action');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            const newConfig = {
                ...config,
                selectedFacebookPage: selectedFacebookPage,
                selectedForm: selectedForm,
                bulkAction: bulkAction
            };
            
            setConfig(newConfig);
            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Facebook Form</h3>
                <p className="text-sm text-gray-500">
                    Select a Facebook page and form to configure bulk action settings.
                </p>
            </div>

            {/* Facebook Page Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Facebook Page <span className="text-red-500">*</span>
                </Label>
                
                <Select
                    value={selectedFacebookPage}
                    onValueChange={setSelectedFacebookPage}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading Facebook pages..." : "Select a Facebook Page"} />
                    </SelectTrigger>
                    <SelectContent>
                        {facebookPageOptions.map(page => (
                            <SelectItem key={page.value} value={page.value}>
                                {page.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {selectedFacebookPage && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">
                            Selected Page: {facebookPageOptions.find(p => p.value === selectedFacebookPage)?.label}
                        </span>
                        <button
                            onClick={() => setSelectedFacebookPage('')}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Form Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Form <span className="text-red-500">*</span>
                </Label>
                
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading forms..." : "Select a Form"} />
                    </SelectTrigger>
                    <SelectContent>
                        {formOptions.map(form => (
                            <SelectItem key={form.value} value={form.value}>
                                {form.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {selectedForm && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">
                            Selected Form: {formOptions.find(f => f.value === selectedForm)?.label}
                        </span>
                        <button
                            onClick={() => setSelectedForm('')}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Move All Bottom Action (selected in red)
                </Label>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant={bulkAction === 'yes' ? 'default' : 'outline'}
                        onClick={() => handleBulkAction('yes')}
                        className={bulkAction === 'yes' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                    >
                        Move all action to Yes node
                    </Button>
                    <Button
                        type="button"
                        variant={bulkAction === 'no' ? 'default' : 'outline'}
                        onClick={() => handleBulkAction('no')}
                        className={bulkAction === 'no' ? 'bg-gray-600 hover:bg-gray-700 text-white' : ''}
                    >
                        Move all action to No node
                    </Button>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default FacebookFormEvalConfig;