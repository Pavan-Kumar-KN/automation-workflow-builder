import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '../../types';

const ContactTaggedConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [tags, setTags] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch product forms from API
    const fetchTags = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setTags([
                'Tag 1',
                'Tag 2',
                'Tag 3',
                'Tag 4',
                'Tag 5'
            ]);
        } catch (error) {
            alert('Failed to fetch tags');
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
        fetchTags();

    }, [])

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Contact Tagged</h3>
                <p className="text-sm text-gray-500">When a contact is tagged automation will trigger.</p>
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
                    Tags <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading forms..." : "Select Tags"} />
                    </SelectTrigger>
                    <SelectContent>
                        {tags.map((tags, index) => (
                            <SelectItem key={index} value={tags}>
                                {tags}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available tags...</p>
                )}
            </div>

            <Button
                onClick={() => setConfig({ ...config, submitted: true })}
                className="w-full"
            >
                Confirm
            </Button>
        </div>
    );
};

export default ContactTaggedConfig;