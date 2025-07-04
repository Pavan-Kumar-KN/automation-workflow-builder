import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';

const HappyBirthdayConfig = ({ config, setConfig }) => {
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // New state for time functionality
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState('07:03');
    const [selectedBefore, setSelectedBefore] = useState('3 days');
    const [tempHour, setTempHour] = useState(7);
    const [tempMinute, setTempMinute] = useState(3);

    // Time periods from 1 day to 2 months
    const timePeriods = [
        '1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days',
        '1 week', '2 weeks', '3 weeks', '4 weeks',
        '1 month', '2 months'
    ];

    // Generate hours (00-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Generate minutes (00-59)
    const minutes = Array.from({ length: 60 }, (_, i) => i);


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
                selectedTime,
                selectedBefore,
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

    // Handle time input click
    const handleTimeClick = () => {
        // Parse current time to set temp values
        const [hour, minute] = selectedTime.split(':').map(Number);
        setTempHour(hour);
        setTempMinute(minute);
        setShowTimeModal(true);
    };

    // Handle time confirmation
    const handleTimeConfirm = () => {
        const formattedTime = `${tempHour.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`;
        setSelectedTime(formattedTime);
        setShowTimeModal(false);
    };

    // Handle hour selection
    const handleHourSelect = (hour) => {
        setTempHour(hour);
    };

    // Handle minute selection
    const handleMinuteSelect = (minute) => {
        setTempMinute(minute);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-gray-900">Say `Happy birthday`</h3>
                <p className="text-xs text-gray-500 mt-1">Celebrate with an exclusive offer or cheerful message that sends based on the birthday field in your audience.</p>
            </div>

            {/* Before Period Selection */}
            <div className="space-y-1">
                <Label htmlFor="before-period" className="text-xs font-medium text-gray-700">
                    Before <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedBefore}
                    onValueChange={setSelectedBefore}
                >
                    <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                        {timePeriods.map((period, index) => (
                            <SelectItem key={index} value={period} className="text-xs">
                                {period}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-1">
                <Label htmlFor="time-input" className="text-xs font-medium text-gray-700">
                    At <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="time-input"
                        value={selectedTime}
                        onClick={handleTimeClick}
                        readOnly
                        className="w-full h-8 text-xs cursor-pointer pr-8"
                        placeholder="Select time"
                    />
                    <Clock 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 cursor-pointer"
                        onClick={handleTimeClick}
                    />
                </div>
            </div>

            <Button
                onClick={() => setConfig({ ...config, submitted: true })}
                className="w-full h-8 text-xs"
            >
                Confirm
            </Button>

            {/* Time Selection Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-80 max-w-sm mx-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-semibold">Select a Time</h3>
                            <button
                                onClick={() => setShowTimeModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="flex justify-center space-x-4 mb-4">
                            <div className="text-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">Hour</div>
                                <div className="h-32 overflow-y-auto border border-gray-200 rounded w-16">
                                    {hours.map((hour) => (
                                        <button
                                            key={hour}
                                            onClick={() => handleHourSelect(hour)}
                                            className={`w-full py-1 text-xs hover:bg-gray-100 ${
                                                tempHour === hour 
                                                    ? 'bg-black text-white' 
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {hour.toString().padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">Minute</div>
                                <div className="h-32 overflow-y-auto border border-gray-200 rounded w-16">
                                    {minutes.map((minute) => (
                                        <button
                                            key={minute}
                                            onClick={() => handleMinuteSelect(minute)}
                                            className={`w-full py-1 text-xs hover:bg-gray-100 ${
                                                tempMinute === minute 
                                                    ? 'bg-black text-white' 
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {minute.toString().padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowTimeModal(false)}
                                className="flex-1 h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleTimeConfirm}
                                className="flex-1 h-8 text-xs bg-black text-white hover:bg-gray-800"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HappyBirthdayConfig;