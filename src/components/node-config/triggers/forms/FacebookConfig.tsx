import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '../../types';

const FacebookConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                'Quick Enquiry Form'
            ]);
        } catch (error) {
            alert('Failed to fetch product forms');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!config.formType || !selectedForm) {
            alert('Please select both form type and product form');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedForm,
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

    }, [])

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Facebook Forms</h3>
                <p className="text-sm text-gray-500">Select the form which you need to automate</p>
            </div>

            <div>
                {
                    selectedForm && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600">Selected: {selectedForm}</p>
                        </div>
                    )
                }
            </div>


            <div className="space-y-2">
                <Label htmlFor="product-form" className="text-sm font-medium text-gray-700">
                    Facebook Page <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading forms..." : "Select the form from the list"} />
                    </SelectTrigger>
                    <SelectContent>
                        {forms.map((product, index) => (
                            <SelectItem key={index} value={product}>
                                {product}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available forms...</p>
                )}
                <small> Only pages connected through the App Store are available for selection.</small>
            </div>

            <div className="space-y-2">
                <Label htmlFor="product-form" className="text-sm font-medium text-gray-700">
                    Form
                </Label>
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading forms..." : "Select the form from the list"} />
                    </SelectTrigger>
                    <SelectContent>
                        {forms.map((product, index) => (
                            <SelectItem key={index} value={product}>
                                {product}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available forms...</p>
                )}
                <small>Only forms that are mapped and active will be displayed here.</small>
            </div>
            <div className='space-y-2 text-sm'>
                <p>Facebook Lead Testing Tool: Use this tool to test the flow of your automation when receiving leads from Facebook. It allows you to simulate lead submissions to ensure that your automation is functioning correctly.</p>
            </div>
            <Button
                onClick={() => setConfig({ ...config, submitted: true })}
                className="w-full"
            >
                confirm
            </Button>
        </div>
    );
};

export default FacebookConfig;