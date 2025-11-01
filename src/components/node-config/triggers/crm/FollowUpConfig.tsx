import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '../../types';

const FollowUpConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [stages, setStages] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch product forms from API
    const fetchStages = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setStages([
                'created',
                'completed',
                'overdue'
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
        fetchStages();


    }, [])

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Follow Up</h3>
                <p className="text-sm text-gray-500">When a followup has changes automation will trigger.</p>
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
                    Select When Follow Up Changed To<span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading stages..." : "Select Stages"} />
                    </SelectTrigger>
                    <SelectContent>
                        {stages.map((stage, index) => (
                            <SelectItem key={index} value={stage}>
                                {stage}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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

export default FollowUpConfig;
