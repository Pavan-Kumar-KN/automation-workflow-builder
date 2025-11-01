import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfigComponentProps } from '../../types';

const SmsConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [devices, setDevices] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form fields state
    const [formData, setFormData] = useState({
        messageContent: ''
    });

    // Fetch devices from API
    const fetchDevices = async () => {
        setIsLoadingDevices(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockDevices = [
                {
                    id: 'device_1',
                    name: 'Primary WhatsApp Device',
                    status: 'active',
                    phoneNumber: '+1234567890'
                },
                {
                    id: 'device_2',
                    name: 'Secondary WhatsApp Device',
                    status: 'active',
                    phoneNumber: '+0987654321'
                },
                {
                    id: 'device_3',
                    name: 'Backup WhatsApp Device',
                    status: 'inactive',
                    phoneNumber: '+1122334455'
                }
            ];
            setDevices(mockDevices);
        } catch (error) {
            alert('Failed to fetch devices');
        } finally {
            setIsLoadingDevices(false);
        }
    };

    // Fetch WhatsApp templates from API
    const fetchWhatsAppTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockTemplates = [
                {
                    id: 'welcome_whatsapp',
                    name: 'Welcome Message Template',
                    type: 'text',
                    content: 'Welcome to our service! 🎉 We\'re excited to have you on board. If you have any questions, feel free to reach out to us.'
                },
                {
                    id: 'followup_whatsapp',
                    name: 'Follow-up Message Template',
                    type: 'text',
                    content: 'Hi there! 👋 I wanted to follow up on our previous conversation. Do you have any questions or need additional information?'
                },
                {
                    id: 'support_whatsapp',
                    name: 'Support Response Template',
                    type: 'text',
                    content: 'Thank you for contacting our support team! 🔧 We have received your request and will get back to you within 24 hours.'
                },
                {
                    id: 'promotion_whatsapp',
                    name: 'Promotional Message Template',
                    type: 'text',
                    content: 'Don\'t miss out on our exclusive offer! 🎁 Limited time only. Click here to learn more about our special promotion.'
                },
                {
                    id: 'reminder_whatsapp',
                    name: 'Reminder Message Template',
                    type: 'text',
                    content: 'This is a friendly reminder about your upcoming appointment. ⏰ Please let us know if you need to reschedule.'
                }
            ];
            setTemplates(mockTemplates);
        } catch (error) {
            alert('Failed to fetch WhatsApp templates');
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Handle device selection
    const handleDeviceChange = (deviceId) => {
        setSelectedDevice(deviceId);
    };

    // Handle template selection
    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);

        if (templateId && templateId !== 'none') {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setFormData({
                    messageContent: template.content
                });
            }
        } else {
            // Reset form if no template selected or "none" selected
            setFormData({
                messageContent: ''
            });
        }
    };

    // Handle form field changes
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedDevice) {
            alert('Please select a device');
            return;
        }

        if (!formData.messageContent) {
            alert('Please enter message content');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedDevice,
                selectedTemplate,
                whatsappConfig: formData,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            alert('WhatsApp configuration saved successfully!');
        } catch (error) {
            alert('Failed to save WhatsApp configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle create new template (placeholder for now)
    const handleCreateNewTemplate = () => {
        alert('Create New Template functionality would open a modal or navigate to template creation page');
    };

    useEffect(() => {
        fetchDevices();
        fetchWhatsAppTemplates();
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Send SMS</h3>
                <p className="text-sm text-gray-500">Send a SMS to your contacts who reach this point of the automation workflow.</p>
            </div>

            {/* Create New Template Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleCreateNewTemplate}
                    variant="outline"
                    className="bg-black text-white hover:bg-gray-800"
                >
                    Create New Template
                </Button>
            </div>

            {/* Automatic Fallback Info */}
            {selectedDevice && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Automatic Fallback:</strong> If your primary device is deactivated not selected, the system will automatically switch to the next active device.
                    </p>
                </div>
            )}

            {/* Template Selection */}
            <div className="space-y-2">
                <Label htmlFor="template-select" className="text-sm font-medium text-gray-700">
                    Select a template
                </Label>
                <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                    disabled={isLoadingTemplates}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (Manual Entry)</SelectItem>
                        {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                                {template.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoadingTemplates && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available templates...</p>
                )}
            </div>

            {/* Selected Template Display */}
            {selectedTemplate && selectedTemplate !== 'none' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Selected: {templates.find(t => t.id === selectedTemplate)?.name}
                    </p>
                </div>
            )}

            {/* Message Content */}
            <div className="space-y-2">
                <Label htmlFor="message-content" className="text-sm font-medium text-gray-700">
                    Message Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="message-content"
                    placeholder="Type or paste your message content here!"
                    value={formData.messageContent}
                    onChange={(e) => handleFieldChange('messageContent', e.target.value)}
                    className="w-full min-h-[120px] resize-none"
                />
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedDevice}
                className="w-full bg-black text-white hover:bg-gray-800"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default SmsConfig;