import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const ChangeLeadQuality: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [pipelines, setPipelines] = useState([]);
    const [leadQuality, setleadQuality] = useState([])
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Fetch pipelines from API
    const fetchPipelines = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPipelines([
                { id: 'vsl_funnel', name: 'VSL Funnel' },
                { id: 'sales_pipeline', name: 'Sales Pipeline' },
                { id: 'lead_nurturing', name: 'Lead Nurturing' },
                { id: 'customer_onboarding', name: 'Customer Onboarding' },
                { id: 'support_pipeline', name: 'Support Pipeline' },
                { id: 'marketing_funnel', name: 'Marketing Funnel' },
                { id: 'demo_requests', name: 'Demo Requests' }
            ]);

            setleadQuality([
                { id: 'vsl_funnel', name: 'VSL Funnel' },
                { id: 'sales_pipeline', name: 'Sales Pipeline' },
                { id: 'lead_nurturing', name: 'Lead Nurturing' },
                { id: 'customer_onboarding', name: 'Customer Onboarding' },
                { id: 'support_pipeline', name: 'Support Pipeline' },
                { id: 'marketing_funnel', name: 'Marketing Funnel' },
                { id: 'demo_requests', name: 'Demo Requests' }
            ]);
        } catch (error) {
            alert('Failed to fetch pipelines');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedPipeline) {
            alert('Please select a pipeline');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedPipeline,
                pipelineName: pipelines.find(p => p.id === selectedPipeline)?.name,
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
        fetchPipelines();
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Change Lead Quality</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Change Lead Quality in CRM (Selected Pipeline)
                </p>
            </div>

            {/* Pipeline Selection */}
            <div className="space-y-2">
                <Label htmlFor="pipeline-select" className="text-sm font-medium text-gray-700">
                    Select Pipeline
                </Label>
                <Select
                    value={selectedPipeline}
                    onValueChange={setSelectedPipeline}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading pipelines..." : "VSL Funnel"} />
                    </SelectTrigger>
                    <SelectContent>
                        {pipelines.map((pipeline) => (
                            <SelectItem key={pipeline.id} value={pipeline.id}>
                                {pipeline.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available pipelines...</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="pipeline-select" className="text-sm font-medium text-gray-700">
                    Select Lead Quality
                </Label>
                <Select
                    value={selectedPipeline}
                    onValueChange={setSelectedPipeline}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading pipelines..." : "VSL Funnel"} />
                    </SelectTrigger>
                    <SelectContent>
                        {leadQuality.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available pipelines...</p>
                )}
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedPipeline}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default ChangeLeadQuality;