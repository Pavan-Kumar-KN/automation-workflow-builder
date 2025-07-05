import React from 'react';
import { X, Upload, CheckCircle, AlertTriangle, Info, Globe, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface PublishPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish?: (publishData: PublishData) => void;
}

interface PublishData {
  version: string;
  name: string;
  description: string;
  isPublic: boolean;
  environment: 'development' | 'staging' | 'production';
  autoActivate: boolean;
  releaseNotes: string;
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
}

// Mock validation issues
const mockValidationIssues: ValidationIssue[] = [
  {
    type: 'warning',
    message: 'Email action is missing a fallback template',
    nodeId: 'action-1'
  },
  {
    type: 'info',
    message: 'Workflow contains 5 nodes and 4 connections',
  },
  {
    type: 'info',
    message: 'Estimated execution time: 2-5 seconds',
  }
];

const getIssueIcon = (type: ValidationIssue['type']) => {
  switch (type) {
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-600" />;
    default:
      return <Info className="w-4 h-4 text-gray-600" />;
  }
};

const getIssueColor = (type: ValidationIssue['type']) => {
  switch (type) {
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const PublishPanel: React.FC<PublishPanelProps> = ({ 
  isOpen, 
  onClose, 
  onPublish 
}) => {
  const [publishData, setPublishData] = React.useState<PublishData>({
    version: '1.4.0',
    name: 'Enhanced Workflow',
    description: '',
    isPublic: false,
    environment: 'development',
    autoActivate: true,
    releaseNotes: ''
  });

  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate publishing process
    setTimeout(() => {
      if (onPublish) {
        onPublish(publishData);
      }
      setIsPublishing(false);
      onClose();
    }, 2000);
  };

  const hasErrors = mockValidationIssues.some(issue => issue.type === 'error');
  const hasWarnings = mockValidationIssues.some(issue => issue.type === 'warning');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-xl border-r border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Publish Workflow</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Validation Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Validation Status</h3>
          
          {mockValidationIssues.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">All validations passed</span>
            </div>
          ) : (
            <div className="space-y-2">
              {mockValidationIssues.map((issue, index) => (
                <div key={index} className={`flex items-start gap-2 p-3 border rounded-lg ${getIssueColor(issue.type)}`}>
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <span className="text-sm">{issue.message}</span>
                    {issue.nodeId && (
                      <div className="text-xs mt-1 opacity-75">Node: {issue.nodeId}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Version Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Version Information</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Version</label>
              <Input
                value={publishData.version}
                onChange={(e) => setPublishData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 1.4.0"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
              <Input
                value={publishData.name}
                onChange={(e) => setPublishData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Version name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                value={publishData.description}
                onChange={(e) => setPublishData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of changes"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Environment Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Environment Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Target Environment</label>
              <div className="grid grid-cols-1 gap-2">
                {(['development', 'staging', 'production'] as const).map((env) => (
                  <label key={env} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="environment"
                      value={env}
                      checked={publishData.environment === env}
                      onChange={(e) => setPublishData(prev => ({ ...prev, environment: e.target.value as any }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm capitalize">{env}</span>
                    {env === 'production' && <Lock className="w-3 h-3 text-gray-500" />}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Publish Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Publish Options</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Public Access</div>
                  <div className="text-xs text-gray-500">Allow public access to this workflow</div>
                </div>
              </div>
              <Switch
                checked={publishData.isPublic}
                onCheckedChange={(checked) => setPublishData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Auto Activate</div>
                  <div className="text-xs text-gray-500">Automatically activate after publishing</div>
                </div>
              </div>
              <Switch
                checked={publishData.autoActivate}
                onCheckedChange={(checked) => setPublishData(prev => ({ ...prev, autoActivate: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Release Notes</h3>
          <Textarea
            value={publishData.releaseNotes}
            onChange={(e) => setPublishData(prev => ({ ...prev, releaseNotes: e.target.value }))}
            placeholder="Detailed release notes for this version..."
            rows={4}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={hasErrors || isPublishing || !publishData.name || !publishData.version}
            className="flex-1"
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
        
        {hasErrors && (
          <div className="text-xs text-red-600 mt-2">
            Please fix all errors before publishing
          </div>
        )}
        
        {hasWarnings && !hasErrors && (
          <div className="text-xs text-yellow-600 mt-2">
            Warning: Some issues detected but publishing is allowed
          </div>
        )}
      </div>
    </div>
  );
};
