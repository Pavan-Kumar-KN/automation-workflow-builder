import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';


const CalendarEvalConfig: React.FC<ConfigComponentProps> = ({ config, setConfig}) => {
    const [calendars, setCalendars] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    console.log("config", config);

    // Fetch product forms from API
    const fetchCalendars = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setCalendars([
                'Calendar 1',
                'Calendar 2',
                'Calendar 3',
                'Calendar 4',
                'Calendar 5'
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
        fetchCalendars();

    }, [])

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
                <p className="text-sm text-gray-500">{config.description}.</p>
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
                    Calendars <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading calendars..." : "Select Calendar"} />
                    </SelectTrigger>
                    <SelectContent>
                        {calendars.map((calendar, index) => (
                            <SelectItem key={index} value={calendar}>
                                {calendar}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available calendars...</p>
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

export default CalendarEvalConfig;
