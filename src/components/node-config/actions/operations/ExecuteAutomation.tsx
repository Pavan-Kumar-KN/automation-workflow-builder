import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ConfigComponentProps } from '@/components/node-config/types';

const ExecuteAutomation: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [automations, setautomations] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [showBundles, setShowBundles] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Fetch automations from API
    const fetchautomations = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            setautomations([
                { id: 'course_1', name: 'Digital Marketing Fundamentals' },
                { id: 'course_2', name: 'Advanced Sales Techniques' },
                { id: 'course_3', name: 'Customer Success Strategies' },
                { id: 'course_4', name: 'Email Marketing Mastery' },
                { id: 'course_5', name: 'Social Media Marketing' },
                { id: 'course_6', name: 'Content Creation Workshop' },
                { id: 'course_7', name: 'Lead Generation Bootcamp' },
                { id: 'course_8', name: 'Conversion Optimization' },
                { id: 'bundle_1', name: 'Marketing Bundle - Complete Package' },
                { id: 'bundle_2', name: 'Sales Bundle - Pro Edition' },
                { id: 'bundle_3', name: 'Business Growth Bundle' }
            ]);
        } catch (error) {
            alert('Failed to fetch automations');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedCourse,
                courseName: automations.find(c => c.id === selectedCourse)?.name,
                showBundles,
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
        fetchautomations();
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Execute Automation</h3>
            </div>

            {/* Note */}
            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                    Can run another automation workflow
                </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
                <Switch
                    id="show-bundles"
                    checked={showBundles}
                    onCheckedChange={setShowBundles}
                />
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
                <Label htmlFor="course-select" className="text-sm font-medium text-gray-700">
                    Select automation
                </Label>
                <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading ..." : "Select a automation"} />
                    </SelectTrigger>
                    <SelectContent>
                        {automations
                            .filter(course => showBundles ? course.id.startsWith('bundle_') : course.id.startsWith('course_'))
                            .map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available automations...</p>
                )}
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCourse}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default ExecuteAutomation;