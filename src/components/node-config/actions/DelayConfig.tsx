import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfigComponentProps } from '../types';

const DelayConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [delayType, setDelayType] = useState('before');
    const [timeOption, setTimeOption] = useState('5');
    const [customValue, setCustomValue] = useState('1');
    const [customUnit, setCustomUnit] = useState('minutes');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize from existing config
    useEffect(() => {
        if (config.delayType) setDelayType(config.delayType);
        if (config.timeOption) setTimeOption(config.timeOption);
        if (config.customValue) setCustomValue(config.customValue);
        if (config.customUnit) setCustomUnit(config.customUnit);
    }, [config]);



    // Handle form submission
    const handleSubmit = async () => {
        if (timeOption === 'custom' && (!customValue || customValue === '0')) {
            alert('Please enter a valid delay time');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Calculate final delay value
            let finalDelay;
            if (timeOption === 'custom') {
                finalDelay = {
                    value: customValue,
                    unit: customUnit
                };
            } else {
                finalDelay = {
                    value: timeOption,
                    unit: 'minutes'
                };
            }

            // Update config with final values
            setConfig({
                ...config,
                delayType,
                timeOption,
                customValue,
                customUnit,
                finalDelay,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            alert('Delay configuration saved successfully!');
        } catch (error) {
            alert('Failed to save delay configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Delay</h3>
                <p className="text-sm text-gray-500">Add a delay before or after this action in your automation workflow</p>
            </div>

            {/* Delay Type Selection */}
            <div className="space-y-2">
                <Select
                    value={delayType}
                    onValueChange={setDelayType}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select delay type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
                <Select
                    value={timeOption}
                    onValueChange={setTimeOption}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Custom Time Input */}
            {timeOption === 'custom' && (
                <div className="flex gap-2">
                    <Input
                        type="number"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="1"
                        min="1"
                        className="flex-1"
                    />
                    <Select
                        value={customUnit}
                        onValueChange={setCustomUnit}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Advanced Time Window Option */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" id="advanced" className="rounded" />
                <label htmlFor="advanced">Use Advanced Time Window</label>
                <span className="bg-pink-200 text-pink-800 px-2 py-1 rounded text-xs">Beta</span>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-gray-800 text-white"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default DelayConfig;