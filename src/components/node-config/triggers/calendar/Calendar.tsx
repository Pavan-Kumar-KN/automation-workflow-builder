import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const Calendar = ({ config, setConfig, name, description }) => {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendars, setSelectedCalendars] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Initialize selected calendars from config
    useEffect(() => {
        if (config?.selectedCalendars && Array.isArray(config.selectedCalendars)) {
            setSelectedCalendars(config.selectedCalendars);
        }
    }, [config]);

    // Fetch calendars from API
    const fetchCalendars = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setCalendars([
                'Main Calendar',
                'Meeting Calendar',
                'Personal Calendar',
                'Team Calendar',
                'Project Calendar',
                'Sales Calendar',
                'Marketing Calendar',
                'Support Calendar'
            ]);
        } catch (error) {
            alert('Failed to fetch calendars');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle calendar selection
    const handleCalendarSelect = (calendarName) => {
        if (!selectedCalendars.includes(calendarName)) {
            setSelectedCalendars([...selectedCalendars, calendarName]);
        }
        setIsOpen(false);
    };

    // Handle calendar removal
    const handleCalendarRemove = (calendarName) => {
        setSelectedCalendars(selectedCalendars.filter(calendar => calendar !== calendarName));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (selectedCalendars.length === 0) {
            alert('Please select at least one calendar');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedCalendars,
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
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500">{description}.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="calendars-select" className="text-sm font-medium text-gray-700">
                    Calendars <span className="text-red-500">*</span>
                </Label>
                
                {/* Multi-select input area */}
                <div className="relative">
                    <div 
                        className="min-h-[40px] w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {selectedCalendars.length === 0 ? (
                            <span className="text-gray-400">
                                {isLoading ? "Loading calendars..." : "Select Calendars"}
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {selectedCalendars.map((calendar, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm text-gray-700 border"
                                    >
                                        {calendar}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCalendarRemove(calendar);
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
                            {calendars
                                .filter(calendar => !selectedCalendars.includes(calendar))
                                .map((calendar, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => handleCalendarSelect(calendar)}
                                >
                                    {calendar}
                                </div>
                            ))}
                            {calendars.filter(calendar => !selectedCalendars.includes(calendar)).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    All calendars selected
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available calendars...</p>
                )}
            </div>

            {/* Show selected calendars */}
            {selectedCalendars.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Selected Calendars:</p>
                    <div className="space-y-1">
                        {selectedCalendars.map((calendar, index) => (
                            <p key={index} className="text-sm text-gray-700">• {calendar}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Show selected calendars count */}
            {selectedCalendars.length > 0 && (
                <div className="text-sm text-gray-600">
                    {selectedCalendars.length} calendar{selectedCalendars.length === 1 ? '' : 's'} selected for monitoring
                </div>
            )}

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isSubmitting || selectedCalendars.length === 0}
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default Calendar;