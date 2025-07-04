import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfigComponentProps } from '../../types';

const SendMailConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form fields state
    const [formData, setFormData] = useState({
        fromName: '',
        emailSubject: '',
        replyTo: '',
        content: ''
    });

    // Fetch email templates from API
    const fetchEmailTemplates = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockTemplates = [
                {
                    id: 'welcome_template',
                    name: 'Welcome Email Template',
                    fromName: 'David Encoder',
                    subject: 'Welcome to our service!',
                    replyTo: 'welcome@company.com',
                    content: 'Welcome to our service! We\'re excited to have you on board. If you have any questions, feel free to reach out to us.'
                },
                {
                    id: 'newsletter_template',
                    name: 'Newsletter Template',
                    fromName: 'Newsletter Team',
                    subject: 'Weekly Newsletter - Latest Updates',
                    replyTo: 'newsletter@company.com',
                    content: 'Here are the latest updates from our team. Stay tuned for more exciting news and features coming your way.'
                },
                {
                    id: 'support_template',
                    name: 'Support Response Template',
                    fromName: 'Support Team',
                    subject: 'Re: Your Support Request',
                    replyTo: 'support@company.com',
                    content: 'Thank you for contacting our support team. We have received your request and will get back to you within 24 hours.'
                },
                {
                    id: 'promotion_template',
                    name: 'Promotional Email Template',
                    fromName: 'Marketing Team',
                    subject: 'Special Offer Just for You!',
                    replyTo: 'marketing@company.com',
                    content: 'Don\'t miss out on our exclusive offer! Limited time only. Click here to learn more about our special promotion.'
                },
                {
                    id: 'followup_template',
                    name: 'Follow-up Email Template',
                    fromName: 'Sales Team',
                    subject: 'Following up on our conversation',
                    replyTo: 'sales@company.com',
                    content: 'Hi there! I wanted to follow up on our previous conversation. Do you have any questions or need additional information?'
                }
            ];
            setTemplates(mockTemplates);
        } catch (error) {
            alert('Failed to fetch email templates');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle template selection
    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);

        if (templateId && templateId !== 'none') {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setFormData({
                    fromName: template.fromName,
                    emailSubject: template.subject,
                    replyTo: template.replyTo,
                    content: template.content
                });
            }
        } else {
            // Reset form if no template selected or "none" selected
            setFormData({
                fromName: '',
                emailSubject: '',
                replyTo: '',
                content: ''
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
        if (!formData.fromName || !formData.emailSubject || !formData.content) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedTemplate,
                emailConfig: formData,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            alert('Email configuration saved successfully!');
        } catch (error) {
            alert('Failed to save email configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchEmailTemplates();
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Send Email</h3>
                <p className="text-sm text-gray-500">Send an email to your contacts who reach this point of the automation workflow. Set up a personalized email and have it ready to shoot</p>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
                <Label htmlFor="email-template" className="text-sm font-medium text-gray-700">
                    Select Template
                </Label>
                <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading templates..." : "Select Existing Template"} />
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
                {isLoading && (
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

            {/* From Name */}
            <div className="space-y-2">
                <Label htmlFor="from-name" className="text-sm font-medium text-gray-700">
                    From Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="from-name"
                    type="text"
                    placeholder="E.g. David Encoder"
                    value={formData.fromName}
                    onChange={(e) => handleFieldChange('fromName', e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Email Subject */}
            <div className="space-y-2">
                <Label htmlFor="email-subject" className="text-sm font-medium text-gray-700">
                    Email Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email-subject"
                    type="text"
                    placeholder="E.g. Welcome to our mail list"
                    value={formData.emailSubject}
                    onChange={(e) => handleFieldChange('emailSubject', e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Reply To */}
            <div className="space-y-2">
                <Label htmlFor="reply-to" className="text-sm font-medium text-gray-700">
                    Reply To
                </Label>
                <Input
                    id="reply-to"
                    type="email"
                    placeholder="Reply to email address"
                    value={formData.replyTo}
                    onChange={(e) => handleFieldChange('replyTo', e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Content */}
            <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="content"
                    placeholder="Type or paste your content here!"
                    value={formData.content}
                    onChange={(e) => handleFieldChange('content', e.target.value)}
                    className="w-full min-h-[120px] resize-none"
                />

            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default SendMailConfig;