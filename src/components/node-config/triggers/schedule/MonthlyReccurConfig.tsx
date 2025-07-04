import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const MonthlyReccurConfig = ({ config = { label: 'Monthly recurring', description: 'Schedule your campaign to automatically send on a monthly basis, on a particular day of the month' }, setConfig = () => {} }) => {
    const [contactGroups, setContactGroups] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedContactGroup, setSelectedContactGroup] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Days of the month data (1-31)
    const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    // Fetch contact groups from API
    const fetchContactGroups = async () => {
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            setContactGroups([
                'All Clients (0 Contacts)',
                'VIP Customers (25 Contacts)',
                'New Leads (102 Contacts)',
                'Premium Members (45 Contacts)',
                'Trial Users (78 Contacts)'
            ]);
        } catch (error) {
            alert('Failed to fetch contact groups');
        }
    };

    // Handle day selection toggle
    const toggleDaySelection = (day) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            } else {
                return [...prev, day];
            }
        });
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedTime || !selectedContactGroup || selectedDays.length === 0) {
            alert('Please fill in all required fields (Days of month, Time, and Contact Group)');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            // setConfig({
            //     ...config,
            //     selectedForm,
            //     selectedDate,
            //     selectedTime,
            //     selectedContactGroup,
            //     selectedDays,
            //     submitted: true,
            //     submittedAt: new Date().toISOString()
            // });

            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchContactGroups();
    }, []);

    return (
        <div className="space-y-6 ">
            <div>
                <h3 className="font-semibold text-gray-900 text-lg">{config.label}</h3>
                <p className="text-sm text-gray-600 mt-1">
                    {config.description}
                </p>
            </div>

            {/* Days of Month Selection */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    Days of month <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-8 gap-2">
                    {daysOfMonth.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDaySelection(day)}
                            className={`
                                relative h-10 w-8 text-sm font-medium rounded-md border transition-all duration-200 flex items-center justify-center
                                ${selectedDays.includes(day)
                                    ? 'bg-black text-white border-black'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }
                            `}
                        >
                            {day}
                            {selectedDays.includes(day) && (
                                <Check className="absolute top-0.5 right-0.5 h-3 w-3 text-white" />
                            )}
                        </button>
                    ))}
                </div>
                {selectedDays.length > 0 && (
                    <p className="text-xs text-gray-500">
                        Selected days: {selectedDays.sort((a, b) => a - b).join(', ')}
                    </p>
                )}
            </div>

            {/* Time Field */}
            <div className="space-y-2">
                <Label htmlFor="campaign-time" className="text-sm font-medium text-gray-700">
                    At <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="campaign-time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full"
                    placeholder="Select time"
                />
            </div>

            {/* Contact Group Field */}
            <div className="space-y-2">
                <Label htmlFor="contact-group" className="text-sm font-medium text-gray-700">
                    Contact Group <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedContactGroup}
                    onValueChange={setSelectedContactGroup}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading contact groups..." : "Select Contact Group"} />
                    </SelectTrigger>
                    <SelectContent>
                        {contactGroups.map((group, index) => (
                            <SelectItem key={index} value={group}>
                                {group}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading contact groups...</p>
                )}
            </div>

            <Button
                onClick={handleSubmit}
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default MonthlyReccurConfig;