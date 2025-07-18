import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Check, X, Settings, ChevronDown, ChevronRight } from 'lucide-react';

const ApiConfig = () => {
    const [copied, setCopied] = useState(false);
    const [expandedSection, setExpandedSection] = useState('endpoint');
    const [customLabel, setCustomLabel] = useState('');

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onClose = () => {
        console.log('Closing sidebar');
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? '' : section);
    };

    const CollapsibleSection = ({ title, children, sectionKey, isRequired = false }) => {
        const isOpen = expandedSection === sectionKey;

        return (
            <div className="border-b border-gray-200 last:border-b-0">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-0 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-md"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{title}</span>
                        {isRequired && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                {isOpen && (
                    <div className="pb-4 space-y-3">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const CodeBlock = ({ code, language = "bash", onCopy }) => (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-300 font-medium uppercase">{language}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(code)}
                    className="h-6 w-6 p-0 bg-gray-700 hover:bg-gray-600 text-white"
                >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
            </div>
            <div className="p-3">
                <pre className="text-green-400 text-xs overflow-x-auto font-mono leading-relaxed">
                    {code}
                </pre>
            </div>
        </div>
    );

    const ParameterCard = ({ name, description, type, required = false }) => (
        <div className={`border-l-4 pl-3 py-2 rounded-r-md ${required ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
            <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${required ? 'text-red-900' : 'text-blue-900'}`}>
                    {name}
                </div>
                {required && <span className="text-xs text-red-600 font-semibold">REQUIRED</span>}
            </div>
            <div className={`text-xs mt-1 ${required ? 'text-red-700' : 'text-blue-700'}`}>
                {description}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full relative">
            <Card className="h-full rounded-none border-0 shadow-none">

                <CardContent className="p-[0.1rem] space-y-2 overflow-y-auto">
                    {/* API Endpoint */}
                    <CollapsibleSection title="API Endpoint" sectionKey="endpoint" isRequired>
                        <div className="space-y-2">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-[0.1rem]">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                            POST
                                        </span>
                                        <code className="text-xs font-mono text-gray-800 break-all">
                                            /api/automations/68663752549cf/execute
                                        </code>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy('POST https://admin.freetools.co.in/api/automations/68663752549cf/execute')}
                                        className="h-6 w-6 p-0 flex-shrink-0 hover:bg-gray-200"
                                    >
                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600">
                                Full URL: https://admin.freetools.co.in/api/automations/68663752549cf/execute
                            </p>
                        </div>
                    </CollapsibleSection>

                    {/* CURL Example */}
                    <CollapsibleSection title="CURL Example" sectionKey="curl">
                        <CodeBlock
                            code={`curl -X POST \\
-H "Content-Type: application/json" \\
-H "Accept: application/json" \\
https://admin.freetools.co.in/api/automations/68663752549cf/execute \\
-d '{
  "api_token": "81ee6a28f3d45e75ac4032cb7b2a1f8f",
  "contact_name": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+919999999999"
}'`}
                            language="bash"
                            onCopy={(code) => handleCopy(code)}
                        />
                    </CollapsibleSection>

                    {/* Required Parameters */}
                    <CollapsibleSection title="Required Parameters" sectionKey="required" isRequired>
                        <div className="space-y-3">
                            <ParameterCard
                                name="api_token"
                                description="Your authentication token for secure API access"
                                required={true}
                            />
                            <ParameterCard
                                name="contact_name"
                                description="Full name of the contact to be added"
                                required={true}
                            />
                            <ParameterCard
                                name="contact_email"
                                description="Valid email address of the contact"
                                required={true}
                            />
                            <ParameterCard
                                name="contact_phone"
                                description="Phone number with country code (e.g., +91xxxxxxxxxx)"
                                required={true}
                            />
                        </div>
                    </CollapsibleSection>

                    {/* Optional Parameters */}
                    <CollapsibleSection title="Optional Parameters" sectionKey="optional">
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                You can include additional custom fields for enhanced data collection:
                            </p>
                            <ParameterCard
                                name="%contact.custom_field_key%"
                                description="Replace with your actual custom field keys (e.g., company, designation, etc.)"
                                required={false}
                            />
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> Custom field keys should match those configured in your automation settings.
                                </p>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Headers */}
                    <CollapsibleSection title="Required Headers" sectionKey="headers" isRequired>
                        <div className="space-y-2">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <code className="text-xs font-mono text-gray-800">Content-Type: application/json</code>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <code className="text-xs font-mono text-gray-800">Accept: application/json</code>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Response */}
                    <CollapsibleSection title="API Response" sectionKey="response">
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Successful response (200 OK):
                            </p>
                            <CodeBlock
                                code={`{
  "status": "success",
  "message": "Automation triggered successfully",
  "data": {
    "automation_id": "68663752549cf",
    "contact_id": "12345",
    "timestamp": "2024-01-20T10:30:00Z"
  }
}`}
                                language="json"
                                onCopy={(code) => handleCopy(code)}
                            />
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800">
                                    <strong>Error responses:</strong> Will include appropriate HTTP status codes (400, 401, 500) with error details in the response body.
                                </p>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        {/* <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button> */}
                        <Button
                            onClick={() => {
                                // Handle confirmation logic here
                                console.log('API Configuration confirmed');
                            }}
                            className="flex-1"
                        >
                            Confirm Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApiConfig;