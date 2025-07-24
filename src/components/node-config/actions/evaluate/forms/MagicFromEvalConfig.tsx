import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import BranchShift from '@/components/node-config/config-components/BranchShift';

const MagicFromEvalConfig = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedForm, setSelectedForm] = useState('');
    const [bulkAction, setBulkAction] = useState('');
    const [formOptions, setFormOptions] = useState([]);

    // Fetch form data
    const fetchForms = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Sample form data
            const formData = [
                { value: 'form_1', label: 'Contact Us Form' },
                { value: 'form_2', label: 'Newsletter Signup' },
                { value: 'form_3', label: 'Lead Generation Form' },
                { value: 'form_4', label: 'Product Demo Request' },
                { value: 'form_5', label: 'Support Ticket Form' },
                { value: 'form_6', label: 'Feedback Survey' },
                { value: 'form_7', label: 'Quote Request Form' },
                { value: 'form_8', label: 'Registration Form' },
                { value: 'form_9', label: 'Application Form' },
                { value: 'form_10', label: 'Consultation Booking' }
            ];
            
            setFormOptions(formData);
        } catch (error) {
            console.error('Failed to fetch forms:', error);
            alert('Failed to load form data');
        } finally {
            setIsLoading(false);
        }
    };

    // Load form data on component mount
    useEffect(() => {
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
            // Validate selection
            if (!selectedForm) {
                alert('Please select a form from the list');
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
                <h3 className="font-semibold text-gray-900">Forms</h3>
                <p className="text-sm text-gray-500">
                    Select a form from the list and configure bulk action settings.
                </p>
            </div>

            {/* Form Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Forms <span className="text-red-500">*</span>
                </Label>
                
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading forms..." : "Select a Form from list"} />
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
                            Selected: {formOptions.find(f => f.value === selectedForm)?.label}
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
         <BranchShift nodeid={config.graphNodeId}/>
            

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default MagicFromEvalConfig;