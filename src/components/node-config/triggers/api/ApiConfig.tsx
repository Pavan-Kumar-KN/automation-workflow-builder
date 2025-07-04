import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, X, Settings, ChevronDown, ChevronRight } from 'lucide-react';

// Mock props for demonstration
const mockConfig = {
    label: "API Configuration",
    description: "Configure your API settings and authentication parameters.",
    submitted: false
};

const ApiConfig = () => {
    const [config, setConfig] = useState(mockConfig);
    const [products, setProducts] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandedSection, setExpandedSection] = useState('endpoint');

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onClose = () => {
        // Mock close function
        console.log('Closing sidebar');
    };

    const getNodeIcon = () => "🔧";

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? '' : section);
    };

    const CollapsibleSection = ({ title, children, sectionKey, defaultOpen = false }) => {
        const isOpen = expandedSection === sectionKey;

        return (
            <div className="border-b">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-2 py-2 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                    <span className="font-medium text-sm">{title}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isOpen && (
                    <div className="px-2 pb-2 border-t bg-gray-50/30">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const renderConfigForm = () => {
        return (
            <div>
                {/* Header */}
                <div className="p-2 border-b">
                    <p className="text-sm text-gray-600">{config.description}</p>
                </div>

                {/* API Endpoint */}
                <CollapsibleSection title="API Endpoint" sectionKey="endpoint">
                    <div className="bg-gray-50 p-1">
                        <div className="flex items-start justify-between gap-1">
                            <code className="text-xs break-all flex-1 font-mono">POST /api/automations/68663752549cf/execute</code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy('POST https://admin.freetools.co.in/api/automations/68663752549cf/execute')}
                                className="h-5 w-5 p-0 flex-shrink-0"
                            >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* CURL Example */}
                <CollapsibleSection title="CURL Example" sectionKey="curl">
                    <div className="bg-gray-900">
                        <div className="flex items-center justify-between p-1 bg-gray-800">
                            <span className="text-xs text-gray-300 font-medium">Terminal</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`curl -X POST \\
-H "accept:application/json" \\
https://admin.freetools.co.in/api/automations/68663752549cf/execute \\
-d api_token=81ee6a28f3d45e75ac4032cb7b2a1f8f \\
-d contact_name=John \\
-d contact_email=email@email.com \\
-d contact_phone=+919999999999`)}
                                className="h-5 w-5 p-0 bg-gray-700 hover:bg-gray-600"
                            >
                                {copied ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-white" />}
                            </Button>
                        </div>
                        <div className="p-1">
                            <pre className="text-green-400 text-xs overflow-x-auto">
                                {`curl -X POST \\
-H "accept:application/json" \\
https://admin.freetools.co.in/api/automations/68663752549cf/execute \\
-d api_token=81ee6a28f3d45e75ac4032cb7b2a1f8f \\
-d contact_name=John \\
-d contact_email=email@email.com \\
-d contact_phone=+919999999999`}
                            </pre>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Required Parameters */}
                <CollapsibleSection title="Required Parameters" sectionKey="required">
                    <div>
                        <div className="border-l-4 border-red-500 pl-2 py-1 bg-red-50/50">
                            <div className="text-sm font-medium text-red-900">api_token</div>
                            <div className="text-xs text-red-700">Authentication token for secure API access</div>
                        </div>
                        <div className="border-l-4 border-red-500 pl-2 py-1 bg-red-50/50">
                            <div className="text-sm font-medium text-red-900">contact_name</div>
                            <div className="text-xs text-red-700">Name of the contact to add</div>
                        </div>
                        <div className="border-l-4 border-red-500 pl-2 py-1 bg-red-50/50">
                            <div className="text-sm font-medium text-red-900">contact_email</div>
                            <div className="text-xs text-red-700">Email address of the contact</div>
                        </div>
                        <div className="border-l-4 border-red-500 pl-2 py-1 bg-red-50/50">
                            <div className="text-sm font-medium text-red-900">contact_phone</div>
                            <div className="text-xs text-red-700">Phone number of the contact</div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Optional Parameters */}
                <CollapsibleSection title="Optional Parameters" sectionKey="optional">
                    <div>
                        <p className="text-sm text-gray-600 p-1">Additional parameters for data updates:</p>
                        <div className="border-l-4 border-blue-500 pl-2 py-1 bg-blue-50/50">
                            <div className="text-sm font-medium text-blue-900">%contact.custom_field_key%</div>
                            <div className="text-xs text-blue-700">Placeholder for custom fields</div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Headers */}
                <CollapsibleSection title="Required Headers" sectionKey="headers">
                    <div>
                        <div className="bg-gray-50 p-1">
                            <code className="text-xs font-mono">Content-Type: application/json</code>
                        </div>
                        <div className="bg-gray-50 p-1">
                            <code className="text-xs font-mono">Accept: application/json</code>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Response */}
                <CollapsibleSection title="API Response" sectionKey="response">
                    <div>
                        <p className="text-sm text-gray-600 p-1">Successful response format:</p>
                        <div className="bg-gray-900">
                            <div className="flex items-center justify-between p-1 bg-gray-800">
                                <span className="text-xs text-gray-300 font-medium">JSON Response</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(`{
  "status": "success",
  "message": "Automation triggered successfully",
  "data": {
    "automation_id": "68663752549cf"
  }
}`)}
                                    className="h-5 w-5 p-0 bg-gray-700 hover:bg-gray-600"
                                >
                                    {copied ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-white" />}
                                </Button>
                            </div>
                            <div className="p-1">
                                <pre className="text-green-400 text-xs overflow-x-auto">
                                    {`{
  "status": "success",
  "message": "Automation triggered successfully",
  "data": {
    "automation_id": "68663752549cf"
  }
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        );
    };

    return (
        <div className="w-96 bg-white border-l border-gray-200 shadow-xl overflow-hidden">
            <Card className="h-full rounded-none border-0">
                <CardHeader className="border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-xl">{getNodeIcon()}</span>
                            <CardTitle className="text-lg font-semibold">
                                Configure API
                            </CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-120px)]">
                    {renderConfigForm()}

                </CardContent>
            </Card>
        </div>
    );
};

export default ApiConfig;