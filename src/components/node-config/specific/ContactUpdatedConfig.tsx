import React, { useState } from 'react';
import { User, FileText, Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NodeConfig } from '../types';

interface ContactUpdatedConfigProps {
  config: NodeConfig;
  setConfig: (config: NodeConfig) => void;
}

export const ContactUpdatedConfig: React.FC<ContactUpdatedConfigProps> = ({ config, setConfig }) => {
  const [selectedForm, setSelectedForm] = useState(config.formId || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(config.watchedFields || []);

  // Mock form data - in real app, this would come from API
  const availableForms = [
    { id: 'contact-form-1', name: 'Main Contact Form', fields: ['name', 'email', 'phone', 'company'] },
    { id: 'lead-form-1', name: 'Lead Generation Form', fields: ['name', 'email', 'source', 'interest'] },
    { id: 'newsletter-form', name: 'Newsletter Signup', fields: ['email', 'preferences', 'frequency'] },
    { id: 'support-form', name: 'Support Request Form', fields: ['name', 'email', 'issue', 'priority'] },
  ];

  const selectedFormData = availableForms.find(form => form.id === selectedForm);

  const handleFormChange = (formId: string) => {
    setSelectedForm(formId);
    setSelectedFields([]); // Reset field selection when form changes
    setConfig({
      ...config,
      formId,
      watchedFields: [],
    });
  };

  const handleFieldToggle = (fieldName: string) => {
    const newFields = selectedFields.includes(fieldName)
      ? selectedFields.filter(f => f !== fieldName)
      : [...selectedFields, fieldName];
    
    setSelectedFields(newFields);
    setConfig({
      ...config,
      watchedFields: newFields,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <User className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Contact Updated Trigger</h3>
          <p className="text-sm text-gray-500">Configure which form and fields to monitor</p>
        </div>
      </div>

      {/* Form Selection */}
      <div className="space-y-2">
        <Label htmlFor="form-select" className="text-sm font-medium text-gray-700">
          Select Form to Monitor
        </Label>
        <Select value={selectedForm} onValueChange={handleFormChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a form..." />
          </SelectTrigger>
          <SelectContent>
            {availableForms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{form.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Field Selection */}
      {selectedFormData && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Watch Specific Fields (optional)
          </Label>
          <p className="text-xs text-gray-500">
            Leave empty to trigger on any field update, or select specific fields to monitor
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {selectedFormData.fields.map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field}`}
                  checked={selectedFields.includes(field)}
                  onCheckedChange={() => handleFieldToggle(field)}
                />
                <Label 
                  htmlFor={`field-${field}`}
                  className="text-sm text-gray-700 capitalize cursor-pointer"
                >
                  {field.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Summary */}
      {selectedForm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Settings className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Trigger Configuration</h4>
              <div className="mt-2 text-xs text-red-700 space-y-1">
                <p><strong>Form:</strong> {selectedFormData?.name}</p>
                <p><strong>Monitored Fields:</strong> {
                  selectedFields.length > 0 
                    ? selectedFields.join(', ')
                    : 'All fields'
                }</p>
                <p><strong>Trigger When:</strong> Contact data is updated in the selected form</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
